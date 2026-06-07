"use client"

import React, { useState, useEffect, useRef } from 'react'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal, ModalBody, ModalFooter, ModalBtn } from '@/components/ui/Modal'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select'

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'

import { fetchWithAuth, API_BASE_URL } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'
import { getOrmawaId } from '../../utils/getOrmawaId'

const API = `${API_BASE_URL}/ormawa`

const getFullUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  const baseUrl = API_BASE_URL.replace('/api', '')
  return `${baseUrl}${path}`
}

const getRoleStyle = (role = '') => {
  const r = String(role).toLowerCase().trim();
  if (r.includes('pembina') || r.includes('penanggung jawab')) return 'bg-violet-50 text-violet-700 border-violet-200 ring-1 ring-violet-500/10'
  if (r.includes('sekretaris') || r.includes('bendahara')) return 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/10'
  if (r.includes('koordinator') || r.includes('staf khusus')) return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/10'
  if (r.includes('staff') || r.includes('staf') || r === 'anggota') return 'bg-sky-50 text-sky-700 border-sky-200 ring-1 ring-sky-500/10'
  return 'bg-slate-50 text-slate-600 border-slate-200 ring-1 ring-slate-500/5'
}

const JABATAN = ['Pembina', 'Penanggung Jawab', 'Sekretaris Eksekutif', 'Koordinator Program', 'Staf Khusus']

export default function StaffManagement() {
  const [data, setData] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const ormawaId = getOrmawaId()
  const [form, setForm] = useState({ Nama: '', MahasiswaID: '', Jabatan: 'Pembina', Divisi: 'Umum', Email: '', NoHP: '', OrmawaID: ormawaId })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [mRes, sRes] = await Promise.all([
        fetchWithAuth(`${API}/members?ormawaId=${ormawaId}`),
        fetchWithAuth(`${API}/students`)
      ])
      if (mRes.status === 'success') {
        setData((mRes.data || []).filter(m => ['Pembina', 'Penanggung Jawab', 'Sekretaris Eksekutif', 'Koordinator Program', 'Staf Khusus', 'Ketua', 'Wakil Ketua'].includes(m.Role)))
      }
      if (sRes.status === 'success') setStudents(sRes.data || [])
    } catch {
      toast.error('Gagal memuat data staf')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [ormawaId])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleOpenAdd = () => {
    setIsEditMode(false)
    setForm({ Nama: '', MahasiswaID: '', Jabatan: 'Pembina', Divisi: 'Umum', Email: '', NoHP: '', OrmawaID: ormawaId })
    setSearchQuery('')
    setIsSearching(false)
    setIsCrudOpen(true)
  }

  const handleOpenEdit = (row) => {
    setIsEditMode(true)
    setForm({ 
      id: row.id || row.ID, 
      Nama: row.Mahasiswa?.Nama || '', 
      MahasiswaID: String(row.MahasiswaID || ''), 
      Jabatan: row.Role || 'Pembina', 
      Divisi: row.Divisi || 'Umum',
      Email: row.Mahasiswa?.EmailKampus || '', 
      NoHP: row.Mahasiswa?.NoHP || '', 
      OrmawaID: ormawaId 
    })
    setSearchQuery(row.Mahasiswa ? `${row.Mahasiswa.Nama} (${row.Mahasiswa.NIM})` : '')
    setIsSearching(false)
    setIsCrudOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formId = form.id || form.ID
    const url = isEditMode ? `${API}/members/${formId}` : `${API}/members`
    const method = isEditMode ? 'PUT' : 'POST'
    try {
      const payload = { 
        Role: form.Jabatan, 
        Divisi: form.Divisi,
        MahasiswaID: Number(form.MahasiswaID), 
        OrmawaID: Number(form.OrmawaID),
        EmailKampus: form.Email,
        NoHP: form.NoHP
      }
      const data = await fetchWithAuth(url, { 
        method, 
        body: JSON.stringify(payload), 
        headers: { 'Content-Type': 'application/json' } 
      })
      if (data.status === 'success') {
        toast.success(isEditMode ? 'Data diperbarui' : 'Staf ditambahkan')
        setIsCrudOpen(false)
        fetchData()
      } else {
        toast.error(data.message || 'Gagal menyimpan')
      }
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    const selectedId = selected?.id || selected?.ID
    try {
      const data = await fetchWithAuth(`${API}/members/${selectedId}`, { method: 'DELETE' })
      if (data.status === 'success') {
        toast.success('Staf dihapus')
        setIsDelOpen(false)
        fetchData()
      } else {
        toast.error('Gagal menghapus')
      }
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns = [
    {
      key: 'Mahasiswa', label: 'Profil Staf', className: 'min-w-[280px]',
      render: (val, row) => {
        const fotoUrl = getFullUrl(row.Mahasiswa?.FotoURL || row.Mahasiswa?.foto_url || row.Mahasiswa?.Foto || row.Mahasiswa?.Pengguna?.Foto || null);
        return (
          <div className="flex items-center gap-3">
            {fotoUrl ? (
              <img
                src={fotoUrl}
                alt={row.Mahasiswa?.Nama || 'Staf'}
                className="w-10 h-10 rounded-xl object-cover shrink-0 shadow-sm border border-slate-200"
                onError={(e) => { e.target.src = ''; }}
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-end justify-center overflow-hidden shrink-0 border border-slate-200/60 shadow-sm">
                <span className="material-symbols-outlined text-slate-400 text-2xl mb-1">person</span>
              </div>
            )}
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-bold text-slate-900 font-headline tracking-tighter text-[13px]">{row.Mahasiswa?.Nama || '—'}</span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-tight font-mono">{row.Mahasiswa?.NIM || '—'}</span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'Role', label: 'Jabatan', className: 'w-[200px]',
      render: (val) => (
        <Badge className={cn("font-black text-[10px] px-3 py-1 border shadow-sm rounded-lg uppercase tracking-wider", getRoleStyle(val))}>
          {val || 'Staf'}
        </Badge>
      )
    },
    {
      key: 'Divisi', label: 'Divisi', className: 'w-[180px]',
      render: (val) => val
        ? <Badge className="bg-primary/5 text-primary font-extrabold text-[10px] border border-primary/10 rounded-lg px-2.5 py-0.5">{val}</Badge>
        : <span className="text-slate-400 text-xs font-bold uppercase tracking-wider font-headline">Umum</span>
    },
    {
      key: 'Status', label: 'Status', className: 'w-[130px] text-center', cellClassName: 'text-center',
      render: (val) => {
        const s = String(val || 'aktif').toLowerCase().trim();
        const isAktif = s === 'aktif' || s === '';
        return (
          <Badge className={cn('font-black text-[10px] px-3 py-1 border-none shadow-sm rounded-lg uppercase tracking-wider',
            isAktif ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20' : 'bg-slate-100 text-slate-600')}>
            {isAktif ? 'Aktif' : val}
          </Badge>
        );
      }
    }
  ]

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8 md:px-8 xl:px-12 space-y-8 font-body">
      <Toaster position="top-right" containerStyle={{ zIndex: 99999 }} />

      {/* ── Welcome Banner ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl h-48 flex items-center group shadow-sm border border-slate-200/80">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/50 to-slate-100/50" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, black 1px, transparent 1px), radial-gradient(circle at 80% 20%, black 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 right-40 w-48 h-48 bg-blue-400/5 rounded-full blur-2xl" />

        <div className="relative z-10 px-10 flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-1.5 w-6 bg-primary/40 rounded-full" />
            <span className="text-[10px] font-bold text-slate-400 tracking-[0.25em]">
              Ormawa Admin
            </span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 backdrop-blur-md rounded-xl text-primary shadow-inner">
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>admin_panel_settings</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight font-headline">
              Manajemen Staf
            </h1>
          </div>
          <p className="text-slate-500 font-medium text-sm max-w-2xl leading-relaxed">
            Database keanggotaan pengurus struktural dan pembina organisasi mahasiswa.
          </p>
        </div>
      </section>

      {/* ── Content Area ───────────────────────────────────────────── */}
      <Card className="border border-[#e5e5e5] shadow-sm overflow-hidden bg-white rounded-3xl">
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            searchPlaceholder="Cari nama atau NIM staf..."
            onAdd={handleOpenAdd}
            addLabel="Tambah Staf"
            actions={(row) => (
              <div className="flex items-center justify-end gap-1">
                <button onClick={() => { setSelected(row); setIsDetailOpen(true) }} className="p-1.5 text-slate-400 hover:text-bku-primary hover:bg-bku-primary/10 rounded-lg transition-colors duration-150" title="Detail"><span className="material-symbols-outlined block" style={{ fontSize: '18px' }} >visibility</span></button>
                <button onClick={() => handleOpenEdit(row)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors duration-150" title="Edit"><span className="material-symbols-outlined block" style={{ fontSize: '18px' }} >edit</span></button>
                <button onClick={() => { setSelected(row); setIsDelOpen(true) }} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors duration-150" title="Hapus"><span className="material-symbols-outlined block" style={{ fontSize: '18px' }} >delete</span></button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* DETAIL */}
      <Modal
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Detail Staf"
        subtitle="Informasi lengkap tugas dan kontak pengurus ormawa."
        icon={<span className="material-symbols-outlined">badge</span>}
        maxWidth="max-w-2xl">
        {selected && (() => {
          const selectedFotoUrl = getFullUrl(selected.Mahasiswa?.FotoURL || selected.Mahasiswa?.foto_url || selected.Mahasiswa?.Foto || selected.Mahasiswa?.Pengguna?.Foto || null);
          return (
            <div>
              <ModalBody className="p-0 overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-bku-primary to-[#00174A] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <span className="material-symbols-outlined size-24 rotate-12 text-white">fingerprint</span>
                  </div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent)]" />
                  <div className="absolute -bottom-8 left-6 z-20 p-1 bg-white rounded-[1.2rem] shadow-xl">
                    {selectedFotoUrl ? (
                      <img
                        src={selectedFotoUrl}
                        alt={selected.Mahasiswa?.Nama}
                        className="h-16 w-16 rounded-[1.0rem] object-cover"
                        onError={(e) => { e.target.src = ''; }}
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-[1.0rem] bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 flex items-center justify-center font-headline text-xl font-black border border-slate-200">
                        {selected.Mahasiswa?.Nama?.split(' ').map(n => n[0]).join('').substring(0, 2) || '?'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 pt-10 space-y-6">
                  <div>
                    <h2 className="text-xl font-black font-headline tracking-tighter leading-none" style={{ color: 'var(--theme-h2)' }}>{selected.Mahasiswa?.Nama}</h2>
                    <div className="flex items-center gap-1.5 mt-2.5">
                      <span className="text-[9px] font-black tracking-widest px-2.5 py-0.5 bg-slate-100 text-slate-500 rounded-full font-headline">PENGURUS</span>
                      <span className="text-[10px] text-slate-400 font-bold font-mono">{selected.Mahasiswa?.NIM}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-3xl bg-slate-50/50 border border-slate-100">
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase font-headline">Jabatan Struktural</p>
                      <Badge className={cn("font-black text-[9px] px-2.5 py-0.5 border shadow-sm rounded-lg uppercase tracking-wider", getRoleStyle(selected.Role))}>
                        {selected.Role || 'Staf'}
                      </Badge>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase font-headline">Divisi Kerja</p>
                      <Badge className="bg-primary/5 text-primary font-extrabold text-[9px] border border-primary/10 rounded-lg px-2.5 py-0.5 uppercase tracking-wider">
                        {selected.Divisi || 'Umum'}
                      </Badge>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase font-headline">Email Kampus</p>
                      <p className="text-xs font-bold text-slate-700 underline underline-offset-4 decoration-primary/30">
                        {selected.Mahasiswa?.EmailKampus || selected.Mahasiswa?.email_campuse || '—'}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase font-headline">No. WhatsApp</p>
                      <p className="text-xs font-bold text-slate-700">
                        {selected.Mahasiswa?.NoHP || '—'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase font-headline ml-1">Tugas & Kontribusi</p>
                    <p className="text-xs text-slate-500 leading-relaxed bg-white p-4 rounded-2xl border border-slate-100 italic">
                      "Staf bertanggung jawab dalam membantu koordinasi internal organisasi sesuai dengan jabatan yang diamanahkan."
                    </p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <ModalBtn variant="default" onClick={() => setIsDetailOpen(false)} className="w-full h-11 justify-center rounded-xl bg-bku-primary hover:bg-[#003399]">Tutup Profil</ModalBtn>
              </ModalFooter>
            </div>
          );
        })()}
      </Modal>

      {/* CRUD */}
      <Modal
        open={isCrudOpen}
        onClose={() => setIsCrudOpen(false)}
        title={isEditMode ? 'Edit Staf' : 'Tambah Staf Baru'}
        subtitle="Daftarkan mahasiswa sebagai pengurus struktural ormawa."
        icon={isEditMode ? <span className="material-symbols-outlined">edit</span> : <span className="material-symbols-outlined stroke-[3px]">add</span>}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSave}>
          <ModalBody>
            <div className="space-y-4">
              <div className="space-y-2 relative" ref={dropdownRef}>
                <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline">Pilih Mahasiswa</Label>
                {isEditMode ? (
                  <Input
                    value={form.MahasiswaID ? (() => {
                      const s = students.find(x => (x?.id?.toString() || x?.ID?.toString()) === form?.MahasiswaID?.toString());
                      return s ? `${s.Nama} (${s.NIM})` : '—';
                    })() : '—'}
                    disabled
                    className="h-12 rounded-2xl border-slate-200 bg-slate-100 text-slate-400 font-bold text-sm font-headline cursor-not-allowed"
                  />
                ) : (
                  <div className="relative">
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '18px' }}>search</span>
                      <Input
                        type="text"
                        placeholder="Ketik nama atau NIM mahasiswa..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setIsSearching(true);
                          if (form.MahasiswaID) setForm({ ...form, MahasiswaID: '' });
                        }}
                        className="pl-11 pr-10 h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-bku-primary focus:ring-2 focus:ring-bku-primary/10 transition-all font-bold text-sm"
                      />
                      {form.MahasiswaID && (
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 font-bold" style={{ fontSize: '18px' }}>check_circle</span>
                      )}
                    </div>

                    {isSearching && searchQuery.trim() !== '' && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto p-1 flex flex-col">
                        {students
                          .filter(s => s?.Nama?.toLowerCase().includes(searchQuery.toLowerCase()) || s?.NIM?.toLowerCase().includes(searchQuery.toLowerCase()))
                          .slice(0, 8)
                          .map(s => {
                            const studentFotoUrl = getFullUrl(s?.FotoURL || s?.foto_url || s?.Foto || s?.Pengguna?.Foto || null);
                            return (
                              <button
                                type="button"
                                key={s.id || s.ID}
                                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-xl cursor-pointer transition-all duration-150 my-0.5 hover:bg-blue-50/50 text-slate-700 font-bold"
                                onClick={() => {
                                  setForm({ 
                                    ...form, 
                                    MahasiswaID: s?.id?.toString() || s?.ID?.toString(),
                                    Email: s?.EmailKampus || '',
                                    NoHP: s?.NoHP || ''
                                  });
                                  setSearchQuery(`${s.Nama} (${s.NIM})`);
                                  setIsSearching(false);
                                }}
                              >
                                {studentFotoUrl ? (
                                  <img
                                    src={studentFotoUrl}
                                    alt={s.Nama}
                                    className="w-7 h-7 rounded-lg object-cover shrink-0 border border-slate-200/50 shadow-sm"
                                    onError={(e) => { e.target.src = ''; }}
                                  />
                                ) : (
                                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-end justify-center overflow-hidden shrink-0 border border-slate-200/40">
                                    <span className="material-symbols-outlined text-slate-400 text-base mb-0.5">person</span>
                                  </div>
                                )}
                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs font-bold text-slate-800 truncate">{s.Nama}</span>
                                  <span className="text-[9px] text-slate-400 font-medium font-mono">{s.NIM}</span>
                                </div>
                              </button>
                            );
                          })}
                        {students.filter(s => s?.Nama?.toLowerCase().includes(searchQuery.toLowerCase()) || s?.NIM?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                          <div className="px-3 py-4 text-center text-xs font-medium text-slate-400">
                            Mahasiswa tidak ditemukan
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Jabatan</Label>
                <Select value={form.Jabatan} onValueChange={(val) => setForm({ ...form, Jabatan: val })}>
                  <SelectTrigger className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-xs md:text-sm font-bold text-slate-700 focus:border-bku-primary focus:ring-2 focus:ring-bku-primary/10 transition-all cursor-pointer">
                    <SelectValue placeholder="Pilih Jabatan" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-xl p-1 bg-white font-body">
                    {JABATAN.map((j) => (
                      <SelectItem key={j} value={j} className="rounded-lg text-xs py-1.5 focus:bg-blue-50 focus:text-blue-700 cursor-pointer font-bold text-slate-700">
                        {j}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Divisi</Label>
                <Input value={form.Divisi} onChange={e => setForm({ ...form, Divisi: e.target.value })} placeholder="Masukkan nama divisi..."
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-bku-primary focus:ring-2 focus:ring-bku-primary/10 transition-all font-bold text-xs md:text-sm font-headline" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Email</Label>
                  <Input type="email" value={form.Email} onChange={e => setForm({ ...form, Email: e.target.value })} placeholder="email@bku.ac.id"
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-bku-primary focus:ring-2 focus:ring-bku-primary/10 transition-all font-bold text-xs md:text-sm font-headline" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">No. HP</Label>
                  <Input value={form.NoHP} onChange={e => setForm({ ...form, NoHP: e.target.value })} placeholder="08xx-xxxx-xxxx"
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-bku-primary focus:ring-2 focus:ring-bku-primary/10 transition-all font-bold text-xs md:text-sm font-headline" />
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <ModalBtn variant="ghost" type="button" onClick={() => setIsCrudOpen(false)}>
              Batalkan
            </ModalBtn>
            <ModalBtn type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="material-symbols-outlined animate-spin size-4">sync</span>
              ) : (
                <span className="material-symbols-outlined stroke-[3px]" style={{ fontSize: '14px' }}>save</span>
              )}
              <span className="uppercase tracking-[0.1em]">{isEditMode ? 'Update Record' : 'Simpan Data'}</span>
            </ModalBtn>
          </ModalFooter>
        </form>
      </Modal>

      <DeleteConfirmModal isOpen={isDelOpen} onClose={() => setIsDelOpen(false)} onConfirm={handleDelete}
        title="Hapus Staf?" description="Data staf ini akan dihapus permanen dari sistem." loading={isSubmitting} />
    </div>
  )
}

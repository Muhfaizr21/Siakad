"use client"

import React, { useState, useEffect, useRef } from 'react'
import { DataTable } from '../FacultyAdmin/components/data-table'
import { Badge } from '../FacultyAdmin/components/badge'
import { Button } from '../FacultyAdmin/components/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../FacultyAdmin/components/dialog'
import { DeleteConfirmModal } from '../FacultyAdmin/components/DeleteConfirmModal'
import { Card, CardContent } from '../FacultyAdmin/components/card'
import { Input } from '../FacultyAdmin/components/input'
import { Label } from '../FacultyAdmin/components/label'
import { Avatar, AvatarFallback } from '../FacultyAdmin/components/avatar'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../FacultyAdmin/components/select'
import { Modal, ModalBody, ModalFooter, ModalBtn } from '../FacultyAdmin/components/Modal'

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'

import { fetchWithAuth, API_BASE_URL } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'

const API = `${API_BASE_URL}/ormawa`

const getFullUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  const baseUrl = API_BASE_URL.replace('/api', '')
  return `${baseUrl}${path}`
}

const getRoleStyle = (role = '') => {
  const r = String(role).toLowerCase().trim();
  if (r.includes('ketua umum') || r === 'ketua') return 'bg-violet-50 text-violet-700 border-violet-200 ring-1 ring-violet-500/10'
  if (r.includes('wakil ketua')) return 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-1 ring-indigo-500/10'
  if (r.includes('sekretaris') || r.includes('bendahara')) return 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/10'
  if (r.includes('kepala') || r.includes('kadiv')) return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/10'
  if (r.includes('staff') || r.includes('staf') || r === 'anggota') return 'bg-sky-50 text-sky-700 border-sky-200 ring-1 ring-sky-500/10'
  return 'bg-slate-50 text-slate-600 border-slate-200 ring-1 ring-slate-500/5'
}

const ROLES = ['Ketua', 'Ketua Umum', 'Wakil Ketua', 'Sekretaris', 'Bendahara', 'Kepala Divisi', 'Staff', 'Anggota']

export default function AnggotaManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [members, setMembers] = useState([])
  const [students, setStudents] = useState([])
  const [divisions, setDivisions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const ormawaId = useAuthStore.getState()?.mahasiswa?.ormawaId || useAuthStore.getState()?.mahasiswa?.ID || 1
  const [form, setForm] = useState({ MahasiswaID: '', Role: 'Anggota', Divisi: '', Email: '', NoHP: '', OrmawaID: ormawaId })

  const [isAddingNewDiv, setIsAddingNewDiv] = useState(false)
  const [newDivName, setNewDivName] = useState('')
  const [isSavingDiv, setIsSavingDiv] = useState(false)
  const [periods, setPeriods] = useState([])
  const [selectedPeriod, setSelectedPeriod] = useState('aktif')

  const fetchMembers = async () => {
    setLoading(true)
    try {
      const data = await fetchWithAuth(`${API}/members?ormawaId=${ormawaId}&periode=${selectedPeriod}`)
      if (data.status === 'success') {
        setMembers(data.data || [])
        if (data.periods) {
          setPeriods(data.periods)
        }
      } else {
        toast.error('Gagal memuat anggota')
      }
    } catch { toast.error('Koneksi gagal') } finally { setLoading(false) }
  }
  const fetchStudents = async () => {
    try { const data = await fetchWithAuth(`${API}/students`); if (data.status === 'success') setStudents(data.data || []) } catch { }
  }
  const fetchDivisions = async () => {
    try { const data = await fetchWithAuth(`${API}/divisions?ormawaId=${ormawaId}`); if (data.status === 'success') setDivisions(data.data || []) } catch { }
  }

  const handleCreateDivInline = async () => {
    if (!newDivName.trim()) return
    setIsSavingDiv(true)
    try {
      const data = await fetchWithAuth(`${API}/divisions`, {
        method: 'POST',
        body: JSON.stringify({ Nama: newDivName.trim(), OrmawaID: Number(ormawaId) }),
        headers: { 'Content-Type': 'application/json' }
      })
      if (data.status === 'success') {
        toast.success('Divisi baru dibuat')
        setForm(prev => ({ ...prev, Divisi: newDivName.trim() }))
        setNewDivName('')
        setIsAddingNewDiv(false)
        await fetchDivisions()
      } else {
        toast.error(data.message || 'Gagal membuat divisi')
      }
    } catch {
      toast.error('Koneksi gagal')
    } finally {
      setIsSavingDiv(false)
    }
  }

  useEffect(() => {
    fetchStudents()
    fetchDivisions()
  }, [])

  useEffect(() => {
    fetchMembers()
  }, [selectedPeriod])

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
    setIsEditMode(false); setForm({ MahasiswaID: '', Role: 'Anggota', Divisi: '', OrmawaID: ormawaId }); setSearchQuery(''); setIsSearching(false); setIsCrudOpen(true)
  }
  const handleOpenEdit = (row) => {
    setIsEditMode(true); setForm({ id: row.id || row.ID, MahasiswaID: String(row.MahasiswaID || ''), Role: row.Role || 'Anggota', Divisi: row.Divisi || '', OrmawaID: ormawaId }); setSearchQuery(row.Mahasiswa ? `${row.Mahasiswa.Nama} (${row.Mahasiswa.NIM})` : ''); setIsSearching(false); setIsCrudOpen(true)
  }
  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.MahasiswaID || form.MahasiswaID === '0' || form.MahasiswaID === '') {
      toast.error('Wajib mencari dan memilih mahasiswa terlebih dahulu!')
      return
    }
    setIsSubmitting(true)
    const formId = form.id || form.ID
    const url = isEditMode ? `${API}/members/${formId}` : `${API}/members`
    const method = isEditMode ? 'PUT' : 'POST'
    const payload = { 
      Role: form.Role, 
      Divisi: form.Divisi,
      MahasiswaID: Number(form.MahasiswaID), 
      OrmawaID: Number(form.OrmawaID),
      EmailKampus: form.Email,
      NoHP: form.NoHP
    }
    try {
      const data = await fetchWithAuth(url, { method, body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } })
      if (data.status === 'success') { toast.success(isEditMode ? 'Data diperbarui' : 'Anggota ditambahkan'); setIsCrudOpen(false); fetchMembers() }
      else toast.error(data.message || 'Gagal menyimpan')
    } catch { toast.error('Terjadi kesalahan') } finally { setIsSubmitting(false) }
  }
  const handleDelete = async () => {
    setIsSubmitting(true)
    const selectedId = selected?.id || selected?.ID
    try {
      const data = await fetchWithAuth(`${API}/members/${selectedId}`, { method: 'DELETE' })
      if (data.status === 'success') { toast.success('Anggota deleted'); setIsDelOpen(false); fetchMembers() }
      else toast.error('Gagal menghapus')
    } catch { toast.error('Terjadi kesalahan') } finally { setIsSubmitting(false) }
  }


  const columns = [
    {
      key: 'Mahasiswa', label: 'Profil Anggota', className: 'min-w-[280px]',
      render: (val, row) => {
        const fotoUrl = getFullUrl(row.Mahasiswa?.FotoURL || row.Mahasiswa?.foto_url || row.Mahasiswa?.Foto || row.Mahasiswa?.Pengguna?.Foto || null);
        return (
          <div className="flex items-center gap-3">
            {fotoUrl ? (
              <img
                src={fotoUrl}
                alt={row.Mahasiswa?.Nama || 'Member'}
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
          {val || 'Anggota'}
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
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }} >group</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight font-headline">
              Manajemen Anggota
            </h1>
          </div>
          <p className="text-slate-500 font-medium text-sm max-w-2xl leading-relaxed">
            Database keanggotaan dan struktur kepengurusan organisasi mahasiswa.
          </p>
        </div>
      </section>

      {/* ── Period Filter Bar ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 p-5 rounded-3xl border border-slate-200/60 shadow-sm">
        <div className="space-y-1">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight font-headline">Periode Kepengurusan</h3>
          <p className="text-xs font-semibold text-slate-400">Tampilkan daftar pengurus berdasarkan tahun periode aktif.</p>
        </div>
        <div className="w-full sm:w-72">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="w-full h-12 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm cursor-pointer font-headline"
          >
            <option value="aktif">Aktif Sekarang (Terbaru)</option>
            {periods.map(p => (
              <option key={p} value={p}>Periode {p} (Demisioner/Alumni)</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Content Area ───────────────────────────────────────────── */}
      <Card className="border border-[#e5e5e5] shadow-sm overflow-hidden bg-white rounded-3xl">
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={members}
            loading={loading}
            searchPlaceholder="Cari nama atau NIM anggota..."
            onAdd={handleOpenAdd}
            addLabel="Tambah Anggota"
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
        title="Detail Anggota"
        subtitle="Informasi keanggotaan aktif organisasi mahasiswa."
        icon={<span className="material-symbols-outlined">person</span>}
        maxWidth="max-w-md">
        {selected && (() => {
          const selectedFotoUrl = getFullUrl(selected.Mahasiswa?.FotoURL || selected.Mahasiswa?.foto_url || selected.Mahasiswa?.Foto || selected.Mahasiswa?.Pengguna?.Foto || null);
          return (
            <div>
              <ModalBody className="p-0 overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-bku-primary to-[#00174A] relative">
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none overflow-hidden inset-0">
                    <span className="material-symbols-outlined size-24 rotate-12 text-white absolute -right-4 -top-4">fingerprint</span>
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

                <div className="p-6 pt-10 space-y-4">
                  <div>
                    <h2 className="text-lg font-black font-headline tracking-tighter leading-none" style={{ color: 'var(--theme-h2)' }}>{selected.Mahasiswa?.Nama}</h2>
                    <div className="flex items-center gap-1.5 mt-2.5">
                      <span className="text-[9px] font-black tracking-widest px-2.5 py-0.5 bg-slate-100 text-slate-500 rounded-full font-headline">MAHASISWA</span>
                      <span className="text-[10px] text-slate-400 font-bold font-mono">{selected.Mahasiswa?.NIM}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase mb-1">Jabatan</p>
                      <Badge className={cn("font-black text-[9px] px-2.5 py-0.5 border shadow-sm rounded-lg uppercase tracking-wider", getRoleStyle(selected.Role))}>
                        {selected.Role || 'Anggota'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase mb-1">Divisi</p>
                      <Badge className="bg-primary/5 text-primary font-extrabold text-[9px] border border-primary/10 rounded-lg px-2.5 py-0.5 uppercase tracking-wider">
                        {selected.Divisi || 'Umum'}
                      </Badge>
                    </div>
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
        title={isEditMode ? 'Edit Anggota' : 'Tambah Anggota Baru'}
        subtitle="Daftarkan mahasiswa sebagai anggota aktif ormawa."
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
                        className="pl-11 pr-10 h-12 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-bku-primary focus:ring-2 focus:ring-bku-primary/10 transition-all font-bold text-sm"
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
                                  setForm({ ...form, MahasiswaID: s?.id?.toString() || s?.ID?.toString() });
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[9px] md:text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 font-headline">Jabatan</Label>
                  <Select value={form.Role} onValueChange={(val) => setForm({ ...form, Role: val })}>
                    <SelectTrigger className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-xs md:text-sm font-bold text-slate-700 focus:border-bku-primary focus:ring-2 focus:ring-bku-primary/10 transition-all cursor-pointer">
                      <SelectValue placeholder="Pilih Jabatan" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 shadow-xl p-1 bg-white font-body">
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r} className="rounded-lg text-xs py-1.5 focus:bg-blue-50 focus:text-blue-700 cursor-pointer font-bold text-slate-700">
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <Label className="text-[9px] md:text-[10px] font-black text-slate-400 tracking-[0.2em] font-headline">Divisi</Label>
                    <button 
                      type="button" 
                      onClick={() => setIsAddingNewDiv(!isAddingNewDiv)} 
                      className="text-[9px] font-black text-bku-primary hover:text-[#0B4FAE] tracking-wider uppercase font-headline flex items-center gap-0.5"
                    >
                      <span className="material-symbols-outlined text-[10px] block font-black">add</span>
                      {isAddingNewDiv ? 'Pilih Divisi' : 'Buat Baru'}
                    </button>
                  </div>
                  {isAddingNewDiv ? (
                    <div className="flex gap-2">
                      <Input 
                        value={newDivName} 
                        onChange={e => setNewDivName(e.target.value)} 
                        placeholder="Nama Divisi Baru..." 
                        className="h-12 rounded-2xl border-slate-200 bg-slate-50 font-bold text-xs md:text-sm"
                      />
                      <Button 
                        type="button" 
                        onClick={handleCreateDivInline} 
                        disabled={isSavingDiv || !newDivName.trim()} 
                        className="h-12 px-4 rounded-2xl bg-bku-primary hover:bg-[#0B4FAE] text-white flex items-center justify-center text-xs font-bold shrink-0"
                      >
                        {isSavingDiv ? '...' : 'OK'}
                      </Button>
                    </div>
                  ) : (
                    <Select value={form.Divisi || 'Umum'} onValueChange={(val) => setForm({ ...form, Divisi: val === 'Umum' ? '' : val })}>
                      <SelectTrigger className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-xs md:text-sm font-bold text-slate-700 focus:border-bku-primary focus:ring-2 focus:ring-bku-primary/10 transition-all cursor-pointer">
                        <SelectValue placeholder="Pilih Divisi" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-xl p-1 bg-white font-body">
                        <SelectItem value="Umum" className="rounded-lg text-xs py-1.5 focus:bg-blue-50 focus:text-blue-700 cursor-pointer font-bold text-slate-400">
                          Umum
                        </SelectItem>
                        {divisions.map((d) => (
                          <SelectItem key={d.id || d.ID} value={d.Nama} className="rounded-lg text-xs py-1.5 focus:bg-blue-50 focus:text-blue-700 cursor-pointer font-bold text-slate-700">
                            {d.Nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
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
                <span className="material-symbols-outlined animate-spin size-4" >sync</span>
              ) : (
                <span className="material-symbols-outlined stroke-[3px]" style={{ fontSize: '14px' }} >save</span>
              )}
              <span className="uppercase tracking-[0.1em]">{isEditMode ? 'Update Record' : 'Simpan Data'}</span>
            </ModalBtn>
          </ModalFooter>
        </form>
      </Modal>

      <DeleteConfirmModal isOpen={isDelOpen} onClose={() => setIsDelOpen(false)} onConfirm={handleDelete}
        title="Hapus Anggota?" description="Data keanggotaan ini akan dihapus permanen dari sistem." loading={isSubmitting} />
    </div>
  )
}

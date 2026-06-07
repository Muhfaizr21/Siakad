"use client"
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PageContent, PageHeader } from '@/components/ui/page';



import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { DialogModal } from '@/components/ui/DialogModal'
import { SelectField, SelectOption } from '@/components/ui/SelectField'

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
  if (r.includes('ketua umum') || r === 'ketua') return 'bg-[var(--theme-primary-light)] text-[var(--theme-primary)] border-[var(--theme-primary)]/20'
  if (r.includes('wakil ketua')) return 'bg-[var(--theme-secondary-light)] text-[var(--theme-secondary)] border-[var(--theme-secondary)]/20'
  if (r.includes('sekretaris') || r.includes('bendahara')) return 'bg-[var(--theme-info-light)] text-[var(--theme-info)] border-[var(--theme-info)]/20'
  if (r.includes('kepala') || r.includes('kadiv')) return 'bg-[var(--theme-warning-light)] text-[var(--theme-warning)] border-[var(--theme-warning)]/20'
  if (r.includes('staff') || r.includes('staf') || r === 'anggota') return 'bg-[var(--theme-success-light)] text-[var(--theme-success)] border-[var(--theme-success)]/20'
  return 'bg-[var(--theme-bg)] text-[var(--theme-text-subtle)] border-border'
}

const ROLES = ['Ketua', 'Ketua Umum', 'Wakil Ketua', 'Sekretaris', 'Bendahara', 'Kepala Divisi', 'Staff', 'Anggota']

export default function AnggotaManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [members, setMembers] = useState([])
  const [students, setStudents] = useState([])
  const [divisions, setDivisions] = useState([])
  const [customRoles, setCustomRoles] = useState([])
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
  const ormawaId = getOrmawaId()
  const [form, setForm] = useState({ MahasiswaID: '', Role: 'Anggota', Divisi: '', Email: '', NoHP: '', OrmawaID: ormawaId })

  const user = useAuthStore(state => state.user)
  const userPermissions = user?.permissions || user?.Permissions || []
  const userRoles = (user?.role || '').split(',').map(r => r.trim().toLowerCase())
  const isSuperOrAdmin = userRoles.includes('super_admin') || 
                         userRoles.includes('ormawa_admin') || 
                         userRoles.includes('ormawa')
  const canCreate = isSuperOrAdmin || userPermissions.includes('create_members')
  const canEdit = isSuperOrAdmin || userPermissions.includes('edit_members')
  const canDelete = isSuperOrAdmin || userPermissions.includes('delete_members')

  const [sortConfig, setSortConfig] = useState({ key: 'Nama', direction: 'asc' })
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const [filterRole, setFilterRole] = useState('all')
  const [filterDivisi, setFilterDivisi] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      if (filterRole !== 'all' && (m.Role || 'Anggota') !== filterRole) return false
      if (filterDivisi !== 'all' && (m.Divisi || '') !== filterDivisi) return false
      if (filterStatus !== 'all') {
        const s = String(m.Status || 'aktif').toLowerCase().trim()
        if (filterStatus === 'aktif' && s !== 'aktif' && s !== '') return false
        if (filterStatus === 'nonaktif' && (s === 'aktif' || s === '')) return false
      }
      return true
    })
  }, [members, filterRole, filterDivisi, filterStatus])

  const sortedMembers = useMemo(() => {
    const items = [...filteredMembers]
    items.sort((a, b) => {
      let aVal, bVal
      if (sortConfig.key === 'Nama') {
        aVal = (a.Mahasiswa?.Nama || '').toLowerCase()
        bVal = (b.Mahasiswa?.Nama || '').toLowerCase()
      } else if (sortConfig.key === 'NIM') {
        aVal = (a.Mahasiswa?.NIM || '').toLowerCase()
        bVal = (b.Mahasiswa?.NIM || '').toLowerCase()
      } else {
        aVal = String(a[sortConfig.key] || '').toLowerCase()
        bVal = String(b[sortConfig.key] || '').toLowerCase()
      }
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
    return items
  }, [filteredMembers, sortConfig])

  const [isAddingNewDiv, setIsAddingNewDiv] = useState(false)
  const [newDivName, setNewDivName] = useState('')
  const [isSavingDiv, setIsSavingDiv] = useState(false)
  const [periods, setPeriods] = useState([])
  const [selectedPeriod, setSelectedPeriod] = useState('aktif')
  const [isRegenOpen, setIsRegenOpen] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

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
  const fetchCustomRoles = async () => {
    try { const data = await fetchWithAuth(`${API}/roles?ormawaId=${ormawaId}`); if (data.status === 'success') setCustomRoles(data.data || []) } catch { }
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
    fetchCustomRoles()
  }, [ormawaId])

  useEffect(() => {
    fetchMembers()
  }, [selectedPeriod, ormawaId])

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
    setIsEditMode(false); setForm({ MahasiswaID: '', Role: 'Anggota', Divisi: '', OrmawaID: ormawaId, Mahasiswa: null }); setSearchQuery(''); setIsSearching(false); setIsCrudOpen(true)
  }
  const handleOpenEdit = (row) => {
    setIsEditMode(true); setForm({ id: row.id || row.ID, MahasiswaID: String(row.MahasiswaID || row.mahasiswaID || row.Mahasiswa?.id || row.Mahasiswa?.ID || row.Mahasiswa?.Id || ''), Role: row.Role || 'Anggota', Divisi: row.Divisi || '', OrmawaID: ormawaId, Mahasiswa: row.Mahasiswa }); setSearchQuery(row.Mahasiswa ? `${row.Mahasiswa.Nama || row.Mahasiswa.nama} (${row.Mahasiswa.NIM || row.Mahasiswa.nim})` : ''); setIsSearching(false); setIsCrudOpen(true)
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

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    try {
      const data = await fetchWithAuth(API + '/members/regenerate', { method: 'POST' })
      if (data.status === 'success') {
        toast.success(data.message || 'Regenerasi berhasil')
        setIsRegenOpen(false)
        fetchMembers()
      } else {
        toast.error(data.message || 'Gagal regenerasi')
      }
    } catch (e) {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsRegenerating(false)
    }
  }

  const columns = [
    {
      key: 'Nama', label: 'Profil Anggota', sortable: true, className: 'min-w-[280px]',
      render: (val, row) => {
        const fotoUrl = getFullUrl(row.Mahasiswa?.FotoURL || row.Mahasiswa?.foto_url || row.Mahasiswa?.Foto || row.Mahasiswa?.Pengguna?.Foto || null);
        return (
          <div className="flex items-center gap-3">
            {fotoUrl ? (
              <img src={fotoUrl} alt={row.Mahasiswa?.Nama || 'Member'}
                className="w-10 h-10 rounded-xl object-cover shrink-0 shadow-sm border border-border"
                onError={(e) => { e.target.src = ''; }} />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-[var(--theme-bg)] flex items-end justify-center overflow-hidden shrink-0 border border-border shadow-sm">
                <span className="material-symbols-outlined text-[var(--theme-text-subtle)] text-2xl mb-1">person</span>
              </div>
            )}
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-bold text-[var(--theme-text)] font-headline tracking-tighter text-[13px]">{row.Mahasiswa?.Nama || '—'}</span>
              <span className="text-[10px] text-[var(--theme-text-subtle)] font-semibold tracking-tight font-mono">{row.Mahasiswa?.NIM || '—'}</span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'Role', label: 'Jabatan', sortable: true, className: 'w-[200px]',
      render: (val) => (
        <Badge className={cn("font-semibold text-[10px] px-2.5 py-1 border shadow-none rounded-full uppercase tracking-wider", getRoleStyle(val))}>
          {val || 'Anggota'}
        </Badge>
      )
    },
    {
      key: 'Divisi', label: 'Divisi', sortable: true, className: 'w-[180px]',
      render: (val) => val
        ? <Badge className="bg-[var(--theme-primary-light)] text-[var(--theme-primary)] font-semibold text-[10px] border border-[var(--theme-primary)]/20 rounded-full px-2.5 py-1">{val}</Badge>
        : <span className="text-[var(--theme-text-subtle)] text-xs font-bold uppercase tracking-wider font-headline">Umum</span>
    },
    {
      key: 'Status', label: 'Status', sortable: true, className: 'w-[130px] text-center', cellClassName: 'text-center',
      render: (val) => {
        const s = String(val || 'aktif').toLowerCase().trim();
        const isAktif = s === 'aktif' || s === '';
        return (
          <Badge className={cn('font-semibold text-[10px] px-2.5 py-1 border-none shadow-none rounded-full uppercase tracking-wider',
            isAktif ? 'bg-[var(--theme-success-light)] text-[var(--theme-success)] ring-1 ring-[var(--theme-success)]/20' : 'bg-[var(--theme-bg)] text-[var(--theme-text-subtle)]')}>
            {isAktif ? 'Aktif' : val}
          </Badge>
        );
      }
    }
  ]

  const combinedRoles = Array.from(new Set([
    ...ROLES,
    ...customRoles.map(r => r.Nama || r.nama)
  ])).filter(Boolean)

  return (
    <PageContent className="font-body">
      <Toaster position="top-right" containerStyle={{ zIndex: 99999 }} />

      {/* ── Welcome Banner ─────────────────────────────────────────── */}
      <PageHeader 
        title="Manajemen Anggota"
        subtitle="Database keanggotaan dan struktur kepengurusan organisasi mahasiswa."
        icon="groups"
       
        breadcrumbs={[ { label: 'Dashboard', path: '/ormawa' }, { label: 'Manajemen Anggota', path: '#' } ]} 
      />

      {/* ── Period Filter Bar ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--theme-bg)]/50 p-5 rounded-2xl border border-border shadow-sm">
        <div className="space-y-1">
          <h3 className="text-sm font-black text-[var(--theme-text)] uppercase tracking-tight font-headline">Periode Kepengurusan</h3>
          <p className="text-xs font-semibold text-[var(--theme-text-subtle)]">Tampilkan daftar pengurus berdasarkan tahun periode aktif.</p>
        </div>
        <button type="button" onClick={() => setIsRegenOpen(true)}
          className="h-10 px-5 rounded-xl bg-[var(--theme-error)] hover:bg-[var(--theme-error)]/90 text-white text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm shrink-0 flex items-center gap-2 border-none">
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>history</span>
          Regenerasi
        </button>
        <div className="w-full sm:w-72">
          <SelectField
            value={selectedPeriod}
            onValueChange={setSelectedPeriod}
            className="w-full h-12"
          >
            <SelectOption value="aktif">Aktif Sekarang (Terbaru)</SelectOption>
            {periods.map(p => (
              <SelectOption key={p} value={p}>Periode {p} (Demisioner/Alumni)</SelectOption>
            ))}
          </SelectField>
        </div>
      </div>

      {/* ── Filter Bar ─────────────────────────────────────────────── */}
      <div className="bg-[var(--theme-surface)] rounded-2xl border border-border p-4 flex flex-wrap items-center gap-3 shadow-sm">
        <span className="text-[10px] font-black text-[var(--theme-text-subtle)] uppercase tracking-widest mr-1">Filter</span>

        <SelectField value={filterRole} onValueChange={setFilterRole} className="h-9 min-w-[140px]" placeholder="Semua Jabatan">
          <SelectOption value="all">Semua Jabatan</SelectOption>
          {combinedRoles.map(r => <SelectOption key={r} value={r}>{r}</SelectOption>)}
        </SelectField>

        <SelectField value={filterDivisi} onValueChange={setFilterDivisi} className="h-9 min-w-[140px]" placeholder="Semua Divisi">
          <SelectOption value="all">Semua Divisi</SelectOption>
          {divisions.map(d => <SelectOption key={d.ID || d.id} value={d.Nama || d.nama}>{d.Nama || d.nama}</SelectOption>)}
        </SelectField>

        <SelectField value={filterStatus} onValueChange={setFilterStatus} className="h-9 min-w-[120px]" placeholder="Semua Status">
          <SelectOption value="all">Semua Status</SelectOption>
          <SelectOption value="aktif">Aktif</SelectOption>
          <SelectOption value="nonaktif">Nonaktif</SelectOption>
        </SelectField>

        {(filterRole !== 'all' || filterDivisi !== 'all' || filterStatus !== 'all') && (
          <button onClick={() => { setFilterRole('all'); setFilterDivisi('all'); setFilterStatus('all') }}
            className="h-9 px-4 text-xs font-bold text-[var(--theme-error)] bg-[var(--theme-error-light)] rounded-xl border border-[var(--theme-error)]/20 hover:bg-[var(--theme-error-light)]/80">
            Reset
          </button>
        )}
        <div className="ml-auto text-[10px] font-bold text-[var(--theme-text-subtle)]">
          {sortedMembers.length} / {members.length} anggota
        </div>
      </div>

      {/* ── Content Area ───────────────────────────────────────────── */}
      <Card className="border border-border shadow-sm overflow-hidden bg-[var(--theme-surface)] rounded-2xl">
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={sortedMembers}
            loading={loading}
            sortConfig={sortConfig}
            onSort={handleSort}
            searchPlaceholder="Cari nama atau NIM anggota..."
            onAdd={canCreate ? handleOpenAdd : null}
            addLabel="Tambah Anggota"
            actions={(row) => (
              <div className="flex items-center justify-end gap-1">
                <button onClick={() => { setSelected(row); setIsDetailOpen(true) }} className="p-1.5 text-[var(--theme-text-subtle)] hover:text-[var(--theme-primary)] hover:bg-[var(--theme-primary-light)] rounded-lg transition-colors duration-150" title="Detail"><span className="material-symbols-outlined block" style={{ fontSize: '18px' }} >visibility</span></button>
                {canEdit && (
                  <button onClick={() => handleOpenEdit(row)} className="p-1.5 text-[var(--theme-text-subtle)] hover:text-[var(--theme-warning)] hover:bg-[var(--theme-warning-light)] rounded-lg transition-colors duration-150" title="Edit"><span className="material-symbols-outlined block" style={{ fontSize: '18px' }} >edit</span></button>
                )}
                {canDelete && (
                  <button onClick={() => { setSelected(row); setIsDelOpen(true) }} className="p-1.5 text-[var(--theme-text-subtle)] hover:text-[var(--theme-error)] hover:bg-[var(--theme-error-light)] rounded-lg transition-colors duration-150" title="Hapus"><span className="material-symbols-outlined block" style={{ fontSize: '18px' }} >delete</span></button>
                )}
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* DETAIL */}
      <DialogModal
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Detail Anggota"
        subtitle="Informasi keanggotaan aktif organisasi mahasiswa."
        icon={<span className="material-symbols-outlined">person</span>}
        maxWidth="max-w-md"
        footer={
          <Button onClick={() => setIsDetailOpen(false)} className="w-full h-10 justify-center rounded-xl bg-[var(--theme-primary)] text-white hover:opacity-90">Tutup Profil</Button>
        }
      >
        {selected && (() => {
          const selectedFotoUrl = getFullUrl(selected.Mahasiswa?.FotoURL || selected.Mahasiswa?.foto_url || selected.Mahasiswa?.Foto || selected.Mahasiswa?.Pengguna?.Foto || null);
          return (
            <div>
              <div className="h-32 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-primary-hover)] relative">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none overflow-hidden inset-0">
                  <span className="material-symbols-outlined size-24 rotate-12 text-white absolute -right-4 -top-4">fingerprint</span>
                </div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent)]" />
                <div className="absolute -bottom-8 left-6 z-20 p-1 bg-[var(--theme-surface)] rounded-2xl shadow-xl">
                  {selectedFotoUrl ? (
                    <img
                      src={selectedFotoUrl}
                      alt={selected.Mahasiswa?.Nama}
                      className="h-16 w-16 rounded-xl object-cover"
                      onError={(e) => { e.target.src = ''; }}
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-[var(--theme-bg)] to-[var(--theme-border-muted)] text-[var(--theme-text)] flex items-center justify-center font-headline text-xl font-black border border-border">
                      {selected.Mahasiswa?.Nama?.split(' ').map(n => n[0]).join('').substring(0, 2) || '?'}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 pt-10 space-y-4">
                <div>
                  <h2 className="text-lg font-black font-headline tracking-tighter leading-none text-[var(--theme-text)]">{selected.Mahasiswa?.Nama}</h2>
                  <div className="flex items-center gap-1.5 mt-2.5">
                    <span className="text-[9px] font-black tracking-widest px-2.5 py-1 bg-[var(--theme-bg)] text-[var(--theme-text-subtle)] rounded-full font-headline">MAHASISWA</span>
                    <span className="text-[10px] text-[var(--theme-text-subtle)] font-bold font-mono">{selected.Mahasiswa?.NIM}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-[var(--theme-bg)]/50 rounded-2xl p-4 border border-border">
                  <div>
                    <p className="text-[9px] font-black text-[var(--theme-text-subtle)] tracking-widest uppercase mb-1">Jabatan</p>
                    <Badge className={cn("font-semibold text-[9px] px-2.5 py-1 border shadow-none rounded-full uppercase tracking-wider", getRoleStyle(selected.Role))}>
                      {selected.Role || 'Anggota'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-[var(--theme-text-subtle)] tracking-widest uppercase mb-1">Divisi</p>
                    <Badge className="bg-[var(--theme-primary-light)] text-[var(--theme-primary)] font-semibold text-[9px] border border-[var(--theme-primary)]/20 rounded-full px-2.5 py-1 uppercase tracking-wider">
                      {selected.Divisi || 'Umum'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </DialogModal>

      {/* CRUD */}
      <DialogModal
        open={isCrudOpen}
        onClose={() => setIsCrudOpen(false)}
        title={isEditMode ? 'Edit Anggota' : 'Tambah Anggota Baru'}
        subtitle="Daftarkan mahasiswa sebagai anggota aktif ormawa."
        icon={isEditMode ? <span className="material-symbols-outlined">edit</span> : <span className="material-symbols-outlined stroke-[3px]">add</span>}
        maxWidth="max-w-lg"
        footer={
          <>
            <Button variant="ghost" type="button" onClick={() => setIsCrudOpen(false)} className="rounded-xl h-10">
              Batalkan
            </Button>
            <Button type="button" onClick={handleSave} disabled={isSubmitting} className="rounded-xl h-10 bg-[var(--theme-primary)] text-white hover:opacity-90 flex items-center gap-1">
              {isSubmitting ? (
                <span className="material-symbols-outlined animate-spin size-4" >sync</span>
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >save</span>
              )}
              <span className="uppercase tracking-[0.1em]">{isEditMode ? 'Update Record' : 'Simpan Data'}</span>
            </Button>
          </>
        }
      >
        <div className="p-6">
          <div className="space-y-4">
            <div className="space-y-2 relative" ref={dropdownRef}>
              <Label className="text-[10px] font-black text-[var(--theme-text-subtle)] tracking-[0.2em] ml-1 font-headline">Pilih Mahasiswa</Label>
              {isEditMode ? (
                <Input
                  value={form.Mahasiswa ? `${form.Mahasiswa.Nama || form.Mahasiswa.nama} (${form.Mahasiswa.NIM || form.Mahasiswa.nim})` : '—'}
                  disabled
                  className="h-12 rounded-2xl border-border bg-[var(--theme-bg)] text-[var(--theme-text-subtle)] font-bold text-sm font-headline cursor-not-allowed"
                />
              ) : (
                <div className="relative">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--theme-text-subtle)]" style={{ fontSize: '18px' }}>search</span>
                    <Input
                      type="text"
                      placeholder="Ketik nama atau NIM mahasiswa..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsSearching(true);
                        if (form.MahasiswaID) setForm({ ...form, MahasiswaID: '' });
                      }}
                      className="pl-11 pr-10 h-12 rounded-2xl border-border bg-[var(--theme-bg)]/50 focus:bg-[var(--theme-surface)] focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)] transition-all font-bold text-sm"
                    />
                    {form.MahasiswaID && (
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[var(--theme-success)] font-bold" style={{ fontSize: '18px' }}>check_circle</span>
                    )}
                  </div>

                  {isSearching && searchQuery.trim() !== '' && (
                    <div className="absolute z-50 w-full mt-1 bg-[var(--theme-surface)] border border-border rounded-2xl shadow-xl max-h-60 overflow-y-auto p-1 flex flex-col">
                      {students
                        .filter(s => s?.Nama?.toLowerCase().includes(searchQuery.toLowerCase()) || s?.NIM?.toLowerCase().includes(searchQuery.toLowerCase()))
                        .slice(0, 8)
                        .map(s => {
                          const studentFotoUrl = getFullUrl(s?.FotoURL || s?.foto_url || s?.Foto || s?.Pengguna?.Foto || null);
                          return (
                            <button
                              type="button"
                              key={s.id || s.ID}
                              className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-xl cursor-pointer transition-all duration-150 my-0.5 hover:bg-[var(--theme-bg)] text-[var(--theme-text)] font-bold"
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
                                  className="w-7 h-7 rounded-lg object-cover shrink-0 border border-border shadow-sm"
                                  onError={(e) => { e.target.src = ''; }}
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-lg bg-[var(--theme-bg)] flex items-end justify-center overflow-hidden shrink-0 border border-border">
                                  <span className="material-symbols-outlined text-[var(--theme-text-subtle)] text-base mb-0.5">person</span>
                                </div>
                              )}
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-[var(--theme-text)] truncate">{s.Nama}</span>
                                <span className="text-[9px] text-[var(--theme-text-subtle)] font-medium font-mono">{s.NIM}</span>
                              </div>
                            </button>
                          );
                        })}
                      {students.filter(s => s?.Nama?.toLowerCase().includes(searchQuery.toLowerCase()) || s?.NIM?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                        <div className="px-3 py-4 text-center text-xs font-medium text-[var(--theme-text-subtle)]">
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
                <Label className="text-[9px] md:text-[10px] font-black text-[var(--theme-text-subtle)] tracking-[0.2em] ml-1 font-headline">Jabatan</Label>
                <SelectField value={form.Role} onValueChange={(val) => setForm({ ...form, Role: val })} className="w-full h-12">
                  {combinedRoles.map((r) => (
                    <SelectOption key={r} value={r}>
                      {r}
                    </SelectOption>
                  ))}
                </SelectField>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label className="text-[9px] md:text-[10px] font-black text-[var(--theme-text-subtle)] tracking-[0.2em] font-headline">Divisi</Label>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewDiv(!isAddingNewDiv)}
                    className="text-[9px] font-black text-[var(--theme-primary)] hover:text-[var(--theme-primary-hover)] tracking-wider uppercase font-headline flex items-center gap-0.5"
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
                      className="h-12 rounded-2xl border-border bg-[var(--theme-bg)]/50 font-bold text-xs md:text-sm"
                    />
                    <Button
                      type="button"
                      onClick={handleCreateDivInline}
                      disabled={isSavingDiv || !newDivName.trim()}
                      className="h-12 px-4 rounded-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white flex items-center justify-center text-xs font-bold shrink-0 border-none shadow-none"
                    >
                      {isSavingDiv ? '...' : 'OK'}
                    </Button>
                  </div>
                ) : (
                  <SelectField value={form.Divisi || 'Umum'} onValueChange={(val) => setForm({ ...form, Divisi: val === 'Umum' ? '' : val })} className="w-full h-12">
                    <SelectOption value="Umum">
                      Umum
                    </SelectOption>
                    {divisions.map((d) => (
                      <SelectOption key={d.id || d.ID} value={d.Nama}>
                        {d.Nama}
                      </SelectOption>
                    ))}
                  </SelectField>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogModal>

      <DeleteConfirmModal isOpen={isDelOpen} onClose={() => setIsDelOpen(false)} onConfirm={handleDelete}
        title="Hapus Anggota?" description="Data keanggotaan ini akan dihapus permanen dari sistem." loading={isSubmitting} />

      <DeleteConfirmModal isOpen={isRegenOpen} onClose={() => setIsRegenOpen(false)} onConfirm={handleRegenerate}
        title="Regenerasi Kepengurusan?"
        description="Arsipkan semua anggota aktif ke periode sebelumnya. Tindakan ini tidak bisa dikembalikan."
        loading={isRegenerating} />
    </PageContent>
  )
}

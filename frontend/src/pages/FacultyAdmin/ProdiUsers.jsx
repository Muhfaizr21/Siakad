"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { PageContent } from '@/components/ui/page'
import { DashboardHero } from '@/components/ui/dashboard'

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'

import { fetchWithAuth, API_BASE_URL } from '../../services/api'

const API_ADMINS = `${API_BASE_URL}/faculty/prodi-admins`
const API_ROLES  = `${API_BASE_URL}/faculty/prodi-roles`
const API_PRODI  = `${API_BASE_URL}/faculty/majors`

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  SearchableSelect — A styled, searchable dropdown option list               */
/* ═══════════════════════════════════════════════════════════════════════════ */
function SearchableSelect({ value, onChange, options, placeholder, searchPlaceholder = "Cari...", required = false, direction = "down" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);

  // Close dropdown when user clicks outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find(opt => String(opt.value) === String(value));

  const filteredOptions = options.filter(opt =>
    (opt.label || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Invisible input to maintain native HTML5 validation constraints */}
      <input
        type="text"
        tabIndex={-1}
        className="sr-only absolute inset-x-0 bottom-0 h-0 w-full opacity-0 pointer-events-none"
        required={required}
        value={value || ""}
        onChange={() => {}}
      />

      {/* Select Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-10 px-3 border border-[var(--theme-border)] rounded-xl text-sm bg-[var(--theme-surface)] text-[var(--theme-text)] flex items-center justify-between cursor-pointer transition-colors focus-within:border-[var(--theme-primary)] focus-within:ring-2 focus-within:ring-[var(--theme-primary-light)] font-medium"
      >
        <span className={selectedOption ? "text-[var(--theme-text)]" : "text-[var(--theme-text-subtle)]"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span
          className="material-symbols-outlined text-[18px] text-[var(--theme-text-subtle)] transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
        >
          keyboard_arrow_down
        </span>
      </div>

      {/* Styled Popover list */}
      {isOpen && (
        <div className={`absolute z-[100] bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-xl shadow-xl overflow-hidden flex flex-col animate-in fade-in duration-150 md:left-full md:top-0 md:bottom-auto md:ml-4 md:mt-0 md:w-80 md:slide-in-from-left-2 ${
          direction === "up" 
            ? "max-md:left-0 max-md:w-full max-md:bottom-full max-md:mb-1.5 max-md:slide-in-from-bottom-1" 
            : "max-md:left-0 max-md:w-full max-md:mt-1.5 max-md:slide-in-from-top-1"
        }`}>
          {/* Search bar */}
          <div className="p-2 border-b border-[var(--theme-border-muted)] bg-[var(--theme-bg)]/30 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[var(--theme-text-subtle)] ml-1 shrink-0">search</span>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 bg-transparent text-xs outline-none text-[var(--theme-text)] placeholder-[var(--theme-text-subtle)] font-medium"
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="p-1 rounded-full hover:bg-[var(--theme-text-subtle)]/10 text-[var(--theme-text-subtle)] hover:text-[var(--theme-text)] flex items-center justify-center shrink-0"
              >
                <span className="material-symbols-outlined text-[12px]">close</span>
              </button>
            )}
          </div>

          {/* Options Wrapper */}
          <div className="max-h-48 overflow-y-auto no-scrollbar py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-3 text-xs text-[var(--theme-text-subtle)] text-center font-medium">
                Tidak ada hasil ditemukan
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`px-3 py-2 text-xs cursor-pointer font-medium transition-colors flex items-center justify-between ${
                      isSelected
                        ? "bg-[var(--theme-primary-light)] text-[var(--theme-primary)] font-semibold"
                        : "text-[var(--theme-text)] hover:bg-[var(--theme-bg)]"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <span className="material-symbols-outlined text-[14px] text-[var(--theme-primary)] font-bold">check</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  ProdiUsers — Manage prodi_admin accounts under the current faculty       */
/* ═══════════════════════════════════════════════════════════════════════════ */


export default function ProdiUsers() {
  // ── state ──
  const [users, setUsers]     = useState([])
  const [roles, setRoles]     = useState([])
  const [prodis, setProdis]   = useState([])
  const [loading, setLoading] = useState(true)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen]     = useState(false)
  const [isDelOpen, setIsDelOpen]       = useState(false)
  const [selected, setSelected]         = useState(null)
  const [submitting, setSubmitting]     = useState(false)

  const emptyForm = { email: '', password: '', program_studi_id: '', ormawa_assign: '' }
  const [form, setForm] = useState(emptyForm)

  // ── fetchers ──
  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [uRes, rRes, pRes] = await Promise.all([
        fetchWithAuth(API_ADMINS),
        fetchWithAuth(API_ROLES),
        fetchWithAuth(API_PRODI),
      ])
      if (uRes.status === 'success') setUsers(uRes.data || [])
      if (rRes.status === 'success') setRoles(rRes.data || [])
      // prodi endpoint may return { data: [...] } or directly [...]
      const prodiData = pRes?.data || pRes || []
      setProdis(Array.isArray(prodiData) ? prodiData : [])
    } catch (err) {
      toast.error('Gagal memuat data: ' + (err?.message || ''))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── handlers ──
  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.email) return toast.error('Email wajib diisi')
    if (!form.password) return toast.error('Password wajib diisi')
    if (!form.program_studi_id) return toast.error('Program Studi wajib dipilih')
    if (!form.ormawa_assign) return toast.error('Role/Jabatan wajib dipilih')

    setSubmitting(true)
    try {
      const res = await fetchWithAuth(API_ADMINS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          program_studi_id: Number(form.program_studi_id),
          ormawa_assign: form.ormawa_assign,
        }),
      })
      if (res.status === 'success') {
        toast.success('Akun Prodi Admin berhasil dibuat')
        setIsCreateOpen(false)
        setForm(emptyForm)
        fetchAll()
      } else {
        toast.error(res.message || 'Gagal membuat akun')
      }
    } catch (err) {
      toast.error(err?.message || 'Terjadi kesalahan')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    if (!selected) return
    setSubmitting(true)
    try {
      const body = {
        email: form.email,
        program_studi_id: Number(form.program_studi_id),
        ormawa_assign: form.ormawa_assign,
      }
      if (form.password) body.password = form.password

      const res = await fetchWithAuth(`${API_ADMINS}/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.status === 'success') {
        toast.success('Akun berhasil diperbarui')
        setIsEditOpen(false)
        setForm(emptyForm)
        setSelected(null)
        fetchAll()
      } else {
        toast.error(res.message || 'Gagal memperbarui akun')
      }
    } catch (err) {
      toast.error(err?.message || 'Terjadi kesalahan')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selected) return
    setSubmitting(true)
    try {
      const res = await fetchWithAuth(`${API_ADMINS}/${selected.id}`, { method: 'DELETE' })
      if (res.status === 'success') {
        toast.success('Akun berhasil dihapus')
        setIsDelOpen(false)
        setSelected(null)
        fetchAll()
      } else {
        toast.error(res.message || 'Gagal menghapus akun')
      }
    } catch (err) {
      toast.error(err?.message || 'Terjadi kesalahan')
    } finally {
      setSubmitting(false)
    }
  }

  const openEdit = (user) => {
    setSelected(user)
    setForm({
      email: user.email || '',
      password: '',
      program_studi_id: user.program_studi_id ? String(user.program_studi_id) : '',
      ormawa_assign: user.ormawa_assign || '',
    })
    setIsEditOpen(true)
  }

  const openDelete = (user) => {
    setSelected(user)
    setIsDelOpen(true)
  }

  // ── table columns ──
  const columns = [
    {
      key: 'email',
      label: 'Identitas Akun',
      className: 'min-w-[260px]',
      render: (v, row) => (
        <div className="flex items-center gap-3 py-1.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-white" style={{ fontSize: 20 }}>person</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-neutral-900 text-[13.5px] leading-tight tracking-tight">{v}</span>
            <span className="text-[10.5px] text-neutral-400 mt-0.5">Prodi Admin</span>
          </div>
        </div>
      ),
    },
    {
      key: 'prodi_nama',
      label: 'Program Studi',
      className: 'w-[200px]',
      render: (v) => (
        <span className="text-sm font-medium text-neutral-700">{v || '—'}</span>
      ),
    },
    {
      key: 'ormawa_assign',
      label: 'Role / Jabatan',
      className: 'w-[160px]',
      render: (v) => (
        <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 font-semibold text-[11px] px-2.5 py-0.5">
          {v || '—'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Dibuat',
      className: 'w-[140px]',
      render: (v) => {
        if (!v) return '—'
        const d = new Date(v)
        return (
          <span className="text-xs text-neutral-500">
            {d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        )
      },
    },
    {
      key: 'actions',
      label: '',
      className: 'w-[100px] text-right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => openEdit(row)}
            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
            title="Edit"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
          </button>
          <button
            onClick={() => openDelete(row)}
            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
            title="Hapus"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
          </button>
        </div>
      ),
    },
  ]

  // ── render ──
  return (
    <PageContent>
      <Toaster position="top-right" />
        <DashboardHero
          title="Kelola Akun Prodi"
          subtitle="Buat, ubah, dan kelola akun administrator program studi di bawah fakultas Anda."
          icon="manage_accounts"
          actions={
            <Button
              onClick={() => { setForm(emptyForm); setIsCreateOpen(true) }}
              className="bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white shadow-lg shadow-[var(--theme-primary-light)] text-sm px-5 h-10 rounded-xl font-semibold flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person_add</span>
              Tambah Akun
            </Button>
          }
        />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 24 }}>group</span>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-neutral-900">{users.length}</p>
              <p className="text-xs text-neutral-500 font-medium">Total Akun Prodi</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: 24 }}>school</span>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-neutral-900">{prodis.length}</p>
              <p className="text-xs text-neutral-500 font-medium">Program Studi</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-violet-50 to-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-violet-600" style={{ fontSize: 24 }}>security</span>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-neutral-900">{roles.length}</p>
              <p className="text-xs text-neutral-500 font-medium">Role Tersedia</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                <span className="text-sm text-neutral-400 font-medium">Memuat data akun...</span>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-3xl bg-neutral-100 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-neutral-300" style={{ fontSize: 40 }}>person_off</span>
              </div>
              <h3 className="font-bold text-neutral-700 text-lg">Belum ada akun prodi</h3>
              <p className="text-sm text-neutral-400 mt-1 max-w-sm">
                Klik "Tambah Akun" untuk membuat akun administrator program studi pertama.
              </p>
            </div>
          ) : (
            <DataTable columns={columns} data={users} />
          )}
        </CardContent>
      </Card>

      {/* ═══ CREATE MODAL ═══ */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen} maxWidth="max-w-lg">
        <DialogContent className="!overflow-visible">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--theme-primary-light)] flex items-center justify-center text-[var(--theme-primary)] shrink-0">
                <span className="material-symbols-outlined text-[20px]">person_add</span>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-0.5">
                  Tambah Akun
                </p>
                <DialogTitle>Tambah Akun Prodi Admin</DialogTitle>
                <DialogDescription>Buat akun baru untuk administrator program studi.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleCreate} className="p-6 space-y-4 text-[var(--theme-text)]">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">Email</label>
              <input
                type="email"
                placeholder="admin.prodi@bku.ac.id"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                className="w-full h-10 px-3 border border-[var(--theme-border)] rounded-xl text-sm focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)] outline-none bg-[var(--theme-surface)] text-[var(--theme-text)] transition-colors font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">Password</label>
              <input
                type="password"
                placeholder="Minimal 6 karakter"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                className="w-full h-10 px-3 border border-[var(--theme-border)] rounded-xl text-sm focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)] outline-none bg-[var(--theme-surface)] text-[var(--theme-text)] transition-colors font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">Program Studi</label>
              <SearchableSelect
                value={form.program_studi_id}
                onChange={val => setForm(f => ({ ...f, program_studi_id: val }))}
                options={prodis.map(p => ({
                  value: p.id || p.ID,
                  label: p.nama || p.Nama || p.name
                }))}
                placeholder="— Pilih Program Studi —"
                searchPlaceholder="Cari program studi..."
                required
                direction="up"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">Role / Jabatan</label>
              <SearchableSelect
                value={form.ormawa_assign}
                onChange={val => setForm(f => ({ ...f, ormawa_assign: val }))}
                options={roles.map(r => ({
                  value: r.nama || r.Nama,
                  label: r.nama || r.Nama
                }))}
                placeholder="— Pilih Role —"
                searchPlaceholder="Cari role..."
                required
                direction="up"
              />
              <p className="text-[10px] text-[var(--theme-text-subtle)] font-medium mt-1 leading-normal">
                Role dibuat di halaman <span className="font-semibold text-[var(--theme-primary)]">Role & Akses (RBAC)</span>
              </p>
            </div>

            <DialogFooter className="pt-4 flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)} className="h-10 rounded-xl px-4 font-semibold">
                Batal
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white h-10 rounded-xl px-6 font-semibold shadow-lg shadow-blue-200/40 border-none transition-all"
              >
                {submitting ? 'Menyimpan...' : 'Simpan Akun'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ═══ EDIT MODAL ═══ */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen} maxWidth="max-w-lg">
        <DialogContent className="!overflow-visible">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--theme-warning-light)] flex items-center justify-center text-[var(--theme-warning)] shrink-0">
                <span className="material-symbols-outlined text-[20px]">edit</span>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-0.5">
                  Edit Akun
                </p>
                <DialogTitle>Edit Akun Prodi Admin</DialogTitle>
                <DialogDescription>Perbarui informasi akun {selected?.email}</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleEdit} className="p-6 space-y-4 text-[var(--theme-text)]">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                className="w-full h-10 px-3 border border-[var(--theme-border)] rounded-xl text-sm focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)] outline-none bg-[var(--theme-surface)] text-[var(--theme-text)] transition-colors font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">Password Baru</label>
              <input
                type="password"
                placeholder="Kosongkan jika tidak ingin mengubah"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full h-10 px-3 border border-[var(--theme-border)] rounded-xl text-sm focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)] outline-none bg-[var(--theme-surface)] text-[var(--theme-text)] transition-colors font-medium"
              />
              <p className="text-[10px] text-[var(--theme-text-subtle)] font-medium mt-1 leading-normal">Biarkan kosong untuk mempertahankan password lama</p>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">Program Studi</label>
              <SearchableSelect
                value={form.program_studi_id}
                onChange={val => setForm(f => ({ ...f, program_studi_id: val }))}
                options={prodis.map(p => ({
                  value: p.id || p.ID,
                  label: p.nama || p.Nama || p.name
                }))}
                placeholder="— Pilih Program Studi —"
                searchPlaceholder="Cari program studi..."
                required
                direction="up"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">Role / Jabatan</label>
              <SearchableSelect
                value={form.ormawa_assign}
                onChange={val => setForm(f => ({ ...f, ormawa_assign: val }))}
                options={roles.map(r => ({
                  value: r.nama || r.Nama,
                  label: r.nama || r.Nama
                }))}
                placeholder="— Pilih Role —"
                searchPlaceholder="Cari role..."
                required
                direction="up"
              />
            </div>

            <DialogFooter className="pt-4 flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)} className="h-10 rounded-xl px-4 font-semibold">
                Batal
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white h-10 rounded-xl px-6 font-semibold shadow-lg shadow-amber-200/40 border-none transition-all"
              >
                {submitting ? 'Menyimpan...' : 'Perbarui Akun'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ═══ DELETE MODAL ═══ */}
      <DeleteConfirmModal
        open={isDelOpen}
        onOpenChange={setIsDelOpen}
        onConfirm={handleDelete}
        title="Hapus Akun Prodi Admin"
        description={`Apakah Anda yakin ingin menghapus akun "${selected?.email}"? Akun yang dihapus tidak dapat dikembalikan.`}
        loading={submitting}
      />
    </PageContent>
  )
}

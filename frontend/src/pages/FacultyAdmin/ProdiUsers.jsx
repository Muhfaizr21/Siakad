"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'

import { fetchWithAuth, API_BASE_URL } from '../../services/api'

const API_ADMINS = `${API_BASE_URL}/faculty/prodi-admins`
const API_ROLES  = `${API_BASE_URL}/faculty/prodi-roles`
const API_PRODI  = `${API_BASE_URL}/faculty/majors`

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
    <div className="space-y-6 pb-10">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-2.5">
            <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 28 }}>manage_accounts</span>
            Kelola Akun Prodi
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Buat, ubah, dan kelola akun administrator program studi di bawah fakultas Anda.
          </p>
        </div>
        <Button
          onClick={() => { setForm(emptyForm); setIsCreateOpen(true) }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-200/50 text-sm px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all hover:scale-[1.02]"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person_add</span>
          Tambah Akun
        </Button>
      </div>

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
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 22 }}>person_add</span>
              Tambah Akun Prodi Admin
            </DialogTitle>
            <DialogDescription className="text-sm text-neutral-500">
              Buat akun baru untuk administrator program studi.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-neutral-700">Email</Label>
              <Input
                type="email"
                placeholder="admin.prodi@bku.ac.id"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-neutral-700">Password</Label>
              <Input
                type="password"
                placeholder="Minimal 6 karakter"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-neutral-700">Program Studi</Label>
              <select
                value={form.program_studi_id}
                onChange={e => setForm(f => ({ ...f, program_studi_id: e.target.value }))}
                required
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">— Pilih Program Studi —</option>
                {prodis.map(p => (
                  <option key={p.id || p.ID} value={p.id || p.ID}>
                    {p.nama || p.Nama || p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-neutral-700">Role / Jabatan</Label>
              <select
                value={form.ormawa_assign}
                onChange={e => setForm(f => ({ ...f, ormawa_assign: e.target.value }))}
                required
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">— Pilih Role —</option>
                {roles.map(r => (
                  <option key={r.id || r.ID} value={r.nama || r.Nama}>
                    {r.nama || r.Nama}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-neutral-400 mt-1">
                Role dibuat di halaman <span className="font-semibold text-blue-500">Role & Akses (RBAC)</span>
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)} className="rounded-xl">
                Batal
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl px-6 font-semibold shadow-lg shadow-blue-200/40"
              >
                {submitting ? 'Menyimpan...' : 'Simpan Akun'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ═══ EDIT MODAL ═══ */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600" style={{ fontSize: 22 }}>edit</span>
              Edit Akun Prodi Admin
            </DialogTitle>
            <DialogDescription className="text-sm text-neutral-500">
              Perbarui informasi akun <strong>{selected?.email}</strong>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-neutral-700">Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-neutral-700">Password Baru</Label>
              <Input
                type="password"
                placeholder="Kosongkan jika tidak ingin mengubah"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="rounded-xl"
              />
              <p className="text-[11px] text-neutral-400">Biarkan kosong untuk mempertahankan password lama</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-neutral-700">Program Studi</Label>
              <select
                value={form.program_studi_id}
                onChange={e => setForm(f => ({ ...f, program_studi_id: e.target.value }))}
                required
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">— Pilih Program Studi —</option>
                {prodis.map(p => (
                  <option key={p.id || p.ID} value={p.id || p.ID}>
                    {p.nama || p.Nama || p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-neutral-700">Role / Jabatan</Label>
              <select
                value={form.ormawa_assign}
                onChange={e => setForm(f => ({ ...f, ormawa_assign: e.target.value }))}
                required
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">— Pilih Role —</option>
                {roles.map(r => (
                  <option key={r.id || r.ID} value={r.nama || r.Nama}>
                    {r.nama || r.Nama}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)} className="rounded-xl">
                Batal
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl px-6 font-semibold shadow-lg shadow-amber-200/40"
              >
                {submitting ? 'Menyimpan...' : 'Perbarui Akun'}
              </Button>
            </div>
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
    </div>
  )
}

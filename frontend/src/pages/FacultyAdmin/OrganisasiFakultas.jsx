"use client"

import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { toast, Toaster } from 'react-hot-toast'

import { cn } from '@/lib/utils'
import { API_BASE_URL } from '../../services/api'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select"
import { Button } from "@/components/ui/Button"
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal"
import Dialog, { DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/Dialog"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { PageContent } from '@/components/ui/page'
import { DashboardHero } from '@/components/ui/dashboard'

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Users2 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>groups</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const CheckCircle2 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>check_circle</span>;
const ShieldCheck = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>verified_user</span>;



const API = "/faculty"
const EMPTY_FORM = { kode_org: '', nama_org: '', ketua_nama: '', KetuaID: null, jumlah_anggota: 0, status: 'Aktif', kategori: 'Himpunan', email: '', password: '', phone: '', fakultas_id: '' }

export default function FacultyOrganisasi() {
  const [organizations, setOrgs] = useState([])
  const [students, setStudents] = useState([])
  const [faculties, setFaculties] = useState([])
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isSuperAdmin = user.role === 'super_admin' || user.role === 'kencana_admin'
  const [showModal, setModal] = useState(false)
  const [editingOrg, setEdit] = useState(null)
  const [isSubmitting, setIsSub] = useState(false)
  const [delTarget, setDelTarget] = useState(null)
  const [search, setSearch] = useState('')
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortConfig, setSortConfig] = useState({ key: 'kode', direction: 'asc' })
  const [studentSearch, setStudentSearch] = useState('')
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false)
  const [fakultasSearch, setFakultasSearch] = useState('')
  const [isFakultasDropdownOpen, setIsFakultasDropdownOpen] = useState(false)

  const filteredFaculties = useMemo(() => {
    if (!fakultasSearch || fakultasSearch === '-- Tingkat Universitas --') return faculties
    return faculties.filter(f => (f.nama || f.Nama)?.toLowerCase().includes(fakultasSearch.toLowerCase()))
  }, [faculties, fakultasSearch])

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const q = studentSearch.toLowerCase()
      return !q || s.Nama?.toLowerCase().includes(q) || s.NIM?.includes(q)
    })
  }, [students, studentSearch])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/organizations`)
      const data = res.data
      const mapped = Array.isArray(data.data) ? data.data.map(item => ({
        id: item.ID, nama: item.Nama, kode: item.Singkatan || item.Kode || '',
        status: item.Status || 'Aktif', kategori: item.Kategori || '',
        jumlah_anggota: item.JumlahAnggota || 0, deskripsi: item.Deskripsi || '',
        email: item.Email || '', phone: item.Phone || ''
      })) : []
      setOrgs(mapped)

      const stdRes = await axios.get('/faculty/students')
      setStudents(stdRes.data.data || [])

      if (isSuperAdmin) {
        const facRes = await axios.get('/admin/fakultas')
        setFaculties(facRes.data.data || [])
      }
    } catch { toast.error('Gagal mengambil data organisasi') }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setIsSub(true)
    const payload = { Nama: formData.nama_org, Singkatan: formData.kode_org, Status: formData.status, Kategori: formData.kategori, JumlahAnggota: parseInt(formData.jumlah_anggota) || 0, Deskripsi: formData.ketua_nama, Email: formData.email, Password: formData.password, Phone: formData.phone }
    
    if (formData.KetuaID) {
      payload.KetuaID = parseInt(formData.KetuaID)
      payload.KetuaNama = formData.ketua_nama
    }
    if (isSuperAdmin && formData.fakultas_id) {
      payload.fakultas_id = parseInt(formData.fakultas_id)
    }
    try {
      const targetId = editingOrg ? (editingOrg.id || editingOrg.ID || editingOrg?.Ormawa?.ID || editingOrg?.Ormawa?.id) : null;
      console.log('Editing target ID:', targetId, 'editingOrg:', editingOrg);
      if (editingOrg) { await axios.put(`${API}/organizations/${targetId}`, payload); toast.success('Organisasi diperbarui') }
      else { await axios.post(`${API}/organizations`, payload); toast.success('Organisasi ditambahkan') }
      setModal(false); fetchData()
    } catch (e) { toast.error(`Gagal menyimpan: ${e.response?.data?.message || 'Error'}`) }
    finally { setIsSub(false) }
  }

  const handleDelete = async () => {
    if (!delTarget) return; setIsSub(true)
    const id = delTarget.id || delTarget.ID || delTarget?.Ormawa?.ID || delTarget?.Ormawa?.id;
    try {
      console.log('Deleting target ID:', id, 'from', delTarget);
      const res = await axios.delete(`${API}/organizations/${id}`)
      if (res.data.status === 'success') { toast.success('Organisasi dihapus'); setDelTarget(null); fetchData() }
      else toast.error(res.data.message || 'Gagal hapus')
    } catch (e) { toast.error(e.response?.data?.message || 'Gagal menghapus') }
    finally { setIsSub(false) }
  }

  const openEdit = (org) => { 
    console.log('Open Edit ORMAWA:', org);
    setEdit(org); 
    setFormData({ kode_org: org.kode || org.Singkatan || '', nama_org: org.nama || org.Nama || '', ketua_nama: org.deskripsi || org.Deskripsi || org.ketua_nama || '', KetuaID: org.ketua_id || org.KetuaID || null, jumlah_anggota: org.jumlah_anggota || org.JumlahAnggota || 0, status: org.status || org.Status || 'Aktif', kategori: org.kategori || org.Kategori || 'Himpunan', email: org.email || org.Email || '', password: '', phone: org.phone || org.Phone || '', fakultas_id: org.fakultas_id || org.FakultasID || '' }); 
    const facIdToFind = org.fakultas_id || org.FakultasID;
    const foundFac = faculties.find(f => (f.id || f.ID) === facIdToFind)
    setFakultasSearch(foundFac ? (foundFac.nama || foundFac.Nama) : '')
    setModal(true) 
  }
  const set = (k, v) => setFormData(p => ({ ...p, [k]: v }))

  useEffect(() => { fetchData() }, [])

  const filtered = useMemo(() => organizations.filter(o => {
    const q = search.toLowerCase()
    return !q || o.nama?.toLowerCase().includes(q) || o.kode?.toLowerCase().includes(q)
  }), [organizations, search])

  const sorted = useMemo(() => {
    let items = [...filtered]
    if (sortConfig.key !== null) {
      items.sort((a, b) => {
        let aVal = a[sortConfig.key]
        let bVal = b[sortConfig.key]

        if (typeof aVal === 'string') aVal = aVal.toLowerCase()
        if (typeof bVal === 'string') bVal = bVal.toLowerCase()

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }
    return items
  }, [filtered, sortConfig])

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, currentPage, pageSize])

  const totalItems = filtered.length
  const totalPages = Math.ceil(totalItems / pageSize)

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
    setCurrentPage(1)
  }

  const stats = { total: organizations.length, aktif: organizations.filter(o => o.status === 'Aktif').length, anggota: organizations.reduce((a, o) => a + (o.jumlah_anggota || 0), 0) }

  const kategoriData = useMemo(() => {
    const counts = {}
    organizations.forEach(o => {
      const k = o.kategori || 'Lainnya'
      counts[k] = (counts[k] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [organizations])

  const topAnggotaData = useMemo(() => {
    return [...organizations]
      .sort((a, b) => (b.jumlah_anggota || 0) - (a.jumlah_anggota || 0))
      .slice(0, 10)
      .map(o => ({ name: o.kode || o.nama, value: o.jumlah_anggota || 0 }))
  }, [organizations])

  const PIE_COLORS = ['#00236f', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#ec4899', '#14b8a6']

  return (
    <PageContent>
      <Toaster position="top-right" />
        <DashboardHero
          title="Organisasi "
          highlightedTitle="Fakultas"
          subtitle="Kelola data legalitas dan identitas organisasi mahasiswa di lingkungan fakultas."
          icon="groups"
          badges={[
            { label: 'Master Data ORMAWA', active: false },
            { label: `${stats.aktif} ORMAWA Aktif`, active: true }
          ]}
          actions={
            <button onClick={() => { setEdit(null); setFormData(EMPTY_FORM); setModal(true) }}
              className="h-10 px-4 rounded-xl bg-primary hover:bg-bku-hover text-white text-xs font-bold uppercase tracking-wider gap-2 flex items-center transition-all active:scale-95 shadow-lg shadow-bku-primary/20 shrink-0">
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }} >add</span> Tambah ORMAWA
            </button>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total ORMAWA', value: stats.total, icon: Users2, bg: 'bg-[#eef4ff]', color: 'text-primary', desc: 'Organisasi terdaftar' },
            { label: 'Organisasi Aktif', value: stats.aktif, icon: CheckCircle2, bg: 'bg-emerald-50', color: 'text-emerald-600', desc: 'Status aktif beroperasi' },
            { label: 'Total Anggota', value: stats.anggota, icon: ShieldCheck, bg: 'bg-indigo-50', color: 'text-indigo-600', desc: 'Jangkauan anggota' },
            { label: 'Total Kategori', value: kategoriData.length, icon: Users2, bg: 'bg-amber-50', color: 'text-amber-600', desc: 'Jenis organisasi' },
          ].map(s => (
            <div key={s.label} className="glass-card border border-slate-200/60 rounded-2xl p-5 shadow-none">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', s.bg, s.color)}><s.icon size={18} /></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 leading-none tabular-nums">{loading ? <span className="material-symbols-outlined animate-spin text-slate-300" style={{ fontSize: '18px' }} >sync</span> : s.value}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Pie: Distribusi Kategori */}
            <div className="glass-card border border-slate-200/60 rounded-2xl p-5 shadow-none">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>pie_chart</span>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Distribusi Kategori</span>
              </div>
              <div className="h-[200px] w-full flex items-center justify-center">
                {kategoriData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={kategoriData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
                        {kategoriData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", fontSize: "10px", fontWeight: "bold" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <span className="text-xs text-slate-400 italic">Tidak ada data</span>}
              </div>
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {kategoriData.slice(0, 6).map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-slate-400 truncate leading-none">{item.name}</p>
                      <p className="text-xs font-extrabold text-slate-800 leading-none mt-1">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar: Top 10 Anggota per Ormawa */}
            <div className="glass-card border border-slate-200/60 rounded-2xl p-5 shadow-none">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>bar_chart</span>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Anggota per Ormawa (Top 10)</span>
              </div>
              <div className="h-[200px] w-full">
                {topAnggotaData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={topAnggotaData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 8, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} width={60} />
                      <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", fontSize: "10px", fontWeight: "bold" }} />
                      <Bar dataKey="value" name="Anggota" fill="#00236f" radius={[0, 4, 4, 0]} barSize={14} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="h-full flex items-center justify-center"><span className="text-xs text-slate-400 italic">Tidak ada data</span></div>}
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="glass-card border border-slate-200/60 rounded-2xl shadow-none overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1">
              <h2 className="font-black text-sm uppercase tracking-tight font-headline" style={{ color: 'var(--theme-h2)' }}>Daftar Organisasi Mahasiswa</h2>
              <p className="text-xs text-slate-500 mt-0.5">Menampilkan <span className="font-bold text-slate-900">{filtered.length}</span> dari <span className="font-bold text-primary">{organizations.length}</span> organisasi</p>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '14px' }} >search</span>
              <input type="text" placeholder="Cari nama atau kode..." value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 h-9 w-52 rounded-xl border border-slate-200/60 focus:outline-none focus:border-primary text-sm bg-transparent" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200/60">
                  {[
                    { label: 'Kode', key: 'kode', sortable: true },
                    { label: 'Nama Organisasi', key: 'nama', sortable: true },
                    { label: 'Ketua', key: 'deskripsi', sortable: true },
                    { label: 'Kategori', key: 'kategori', sortable: true },
                    { label: 'Anggota', key: 'jumlah_anggota', sortable: true },
                    { label: 'Status', key: 'status', sortable: true },
                    { label: 'Aksi', key: null, sortable: false },
                  ].map(h => (
                    <th
                      key={h.label}
                      onClick={() => h.sortable && handleSort(h.key)}
                      className={cn(
                        'px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap select-none',
                        h.sortable && 'cursor-pointer hover:text-slate-900 group',
                        h.className
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        {h.label}
                        {h.sortable && (
                          sortConfig.key === h.key ? (
                            sortConfig.direction === 'asc' ? (
                              <span className="material-symbols-outlined size-3.5 text-primary" style={{ fontSize: '14px' }}>expand_less</span>
                            ) : (
                              <span className="material-symbols-outlined size-3.5 text-primary" style={{ fontSize: '14px' }}>expand_more</span>
                            )
                          ) : (
                            <span className="material-symbols-outlined size-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontSize: '14px' }}>unfold_more</span>
                          )
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? Array.from({ length: pageSize }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100">{[...Array(7)].map((__, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-slate-50 rounded animate-pulse" /></td>)}</tr>
                )) : paginated.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-[#eef4ff] rounded-2xl flex items-center justify-center text-primary"><span className="material-symbols-outlined" style={{ fontSize: '22px' }}>group</span></div>
                      <p className="font-bold text-sm text-slate-900">Belum Ada Organisasi</p>
                    </div>
                  </td></tr>
                ) : paginated.map((row, i) => {
                  const getID = (obj) => {
                    const id = obj.id || obj.ID || obj.Ormawa?.ID;
                    console.log("Getting ID for row:", obj, "Result:", id);
                    return id;
                  };

                  return (
                    <tr key={row.id || i} className="border-b border-[#f5f5f5] hover:bg-[#fafbff] transition-colors">
                      <td className="px-5 py-3.5"><span className="text-[10px] font-black text-slate-600 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg uppercase tracking-wider">{row.kode || '—'}</span></td>
                      <td className="px-5 py-3.5"><p className="font-bold text-sm text-slate-900">{row.nama}</p></td>
                      <td className="px-5 py-3.5 text-sm text-slate-600 font-medium">{row.deskripsi || '—'}</td>
                      <td className="px-5 py-3.5"><span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">{row.kategori || '—'}</span></td>
                      <td className="px-5 py-3.5"><div className="flex items-center gap-1.5 text-sm font-black text-slate-900"><span className="material-symbols-outlined text-slate-400" style={{ fontSize: '12px' }}>group</span>{row.jumlah_anggota || 0}</div></td>
                      <td className="px-5 py-3.5">
                        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase',
                          row.status === 'Aktif' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200')}>
                          <span className={cn('w-1.5 h-1.5 rounded-full', row.status === 'Aktif' ? 'bg-emerald-500' : 'bg-rose-500')} />{row.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => openEdit(row)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '15px' }} >edit</span></button>
                          <button onClick={() => setDelTarget(row)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors group-hover:bg-white" title="Hapus"><span className="material-symbols-outlined" style={{ fontSize: '15px' }} >delete</span></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Modern Pagination Footer */}
          <div className="px-6 py-4 bg-transparent border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <p className="text-xs text-slate-500 font-medium text-center sm:text-left">
                Menampilkan <span className="font-semibold text-slate-800">{totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> sampai <span className="font-semibold text-slate-800">{Math.min(currentPage * pageSize, totalItems)}</span> dari <span className="font-semibold text-slate-800">{totalItems}</span> entri
              </p>

              <div className="hidden sm:block h-5 w-px bg-slate-200" />

              <div className="flex items-center gap-2.5">
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Baris per halaman:</span>
                <Select value={String(pageSize)} onValueChange={(val) => { setPageSize(Number(val)); setCurrentPage(1); }}>
                  <SelectTrigger className="h-8 w-24 rounded-lg border-slate-200 bg-white font-semibold text-xs shadow-sm focus:ring-primary/20 px-2.5 py-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-xl p-1 font-body">
                    {[5, 10, 15, 25, 50].map((size) => (
                      <SelectItem key={size} value={String(size)} className="rounded-lg text-xs py-1.5 focus:bg-primary/5 focus:text-primary">
                        {size} Baris
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
                className="h-8 px-3 rounded-lg border-slate-200 bg-white text-slate-600 font-semibold text-xs shadow-sm disabled:opacity-40 hover:bg-slate-50 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined mr-1" style={{ fontSize: '15px' }}>chevron_left</span>
                Sebelumnya
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && currentPage > 3) pageNum = currentPage - 3 + i;
                  if (pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        "w-8 h-8 rounded-lg font-semibold text-xs transition-all duration-200",
                        currentPage === pageNum
                          ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || loading || totalPages === 0}
                className="h-8 px-3 rounded-lg border-slate-200 bg-white text-slate-600 font-semibold text-xs shadow-sm disabled:opacity-40 hover:bg-slate-50 transition-all active:scale-95"
              >
                Berikutnya
                <span className="material-symbols-outlined ml-1" style={{ fontSize: '15px' }}>chevron_right</span>
              </Button>
            </div>
          </div>
        </div>

      {/* Form Modal */}
      <Dialog open={showModal} onOpenChange={setModal} maxWidth="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingOrg ? 'Update Data ORMAWA' : 'Tambah Organisasi'}</DialogTitle>
          <DialogDescription>{editingOrg ? 'Edit Organisasi' : 'Registrasi Baru'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <DialogContent className="space-y-4 p-6 overflow-y-auto max-h-[60vh]">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">Kode Akronim</label>
                <input 
                  value={formData.kode_org} 
                  onChange={e => set('kode_org', e.target.value.toUpperCase())} 
                  placeholder="BEM-FT" 
                  required 
                  className="h-10 w-full rounded-xl border border-[var(--theme-border)] bg-white px-3 text-sm text-[var(--theme-text)] uppercase placeholder:text-[var(--theme-text-subtle)] focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:outline-none transition-colors" 
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">Kategori</label>
                <Select value={formData.kategori} onValueChange={val => set('kategori', val)}>
                  <SelectTrigger className="h-10 w-full rounded-xl border border-[var(--theme-border)] bg-white px-3 text-sm text-[var(--theme-text)] focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:outline-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border border-[var(--theme-border)] shadow-md bg-white">
                    {['BEM', 'Himpunan', 'UKM', 'Komunitas', 'Lainnya'].map(v => (
                      <SelectItem key={v} value={v} className="rounded-lg text-sm py-1.5 focus:bg-[var(--theme-primary-light)] focus:text-[var(--theme-primary)]">
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {isSuperAdmin && (
              <div className="relative">
                <label className="block text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">Pilih Fakultas</label>
                <div className="relative">
                  <div 
                    className="w-full h-10 px-3 rounded-xl border border-[var(--theme-border)] bg-white text-sm text-[var(--theme-text)] flex items-center justify-between cursor-pointer focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:outline-none"
                    onClick={() => setIsFakultasDropdownOpen(!isFakultasDropdownOpen)}
                  >
                    <span className={`truncate ${!formData.fakultas_id ? 'text-[var(--theme-text-subtle)]' : ''}`}>{fakultasSearch || '-- Tingkat Universitas --'}</span>
                    <span className="material-symbols-outlined text-[var(--theme-text-subtle)]">expand_more</span>
                  </div>
                  
                  {isFakultasDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-[var(--theme-border)] rounded-xl shadow-lg max-h-60 overflow-y-auto overflow-x-hidden">
                      <div className="sticky top-0 bg-white p-2 border-b border-[var(--theme-border-muted)]">
                        <input 
                          type="text" 
                          placeholder="Cari fakultas..." 
                          value={fakultasSearch === '-- Tingkat Universitas --' ? '' : fakultasSearch}
                          onChange={e => setFakultasSearch(e.target.value)}
                          className="w-full h-9 px-3 rounded-lg bg-[var(--theme-bg)] border border-[var(--theme-border)] text-sm focus:outline-none focus:border-[var(--theme-primary)]"
                          onClick={e => e.stopPropagation()}
                        />
                      </div>
                      <div className="p-1">
                        <div 
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            set('fakultas_id', '')
                            setFakultasSearch('-- Tingkat Universitas --')
                            setIsFakultasDropdownOpen(false)
                          }}
                          className={`px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-[var(--theme-primary-light)] hover:text-[var(--theme-primary)] ${!formData.fakultas_id ? 'bg-[var(--theme-primary-light)] text-[var(--theme-primary)] font-semibold' : 'text-[var(--theme-text)]'}`}
                        >
                          -- Tingkat Universitas --
                        </div>
                        {filteredFaculties.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-[var(--theme-text-muted)] text-center">Tidak ada fakultas ditemukan</div>
                        ) : (
                          filteredFaculties.map(f => (
                            <div 
                              key={f.id || f.ID}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                set('fakultas_id', f.id || f.ID)
                                setFakultasSearch(f.nama || f.Nama)
                                setIsFakultasDropdownOpen(false)
                              }}
                              className={`px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-[var(--theme-primary-light)] hover:text-[var(--theme-primary)] ${parseInt(formData.fakultas_id) === (f.id || f.ID) ? 'bg-[var(--theme-primary-light)] text-[var(--theme-primary)] font-semibold' : 'text-[var(--theme-text)]'}`}
                            >
                              {f.nama || f.Nama}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">Nama Panjang Organisasi</label>
              <input 
                value={formData.nama_org} 
                onChange={e => set('nama_org', e.target.value)} 
                placeholder="Nama resmi organisasi..." 
                required 
                className="h-10 w-full rounded-xl border border-[var(--theme-border)] bg-white px-3 text-sm text-[var(--theme-text)] placeholder:text-[var(--theme-text-subtle)] focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:outline-none transition-colors" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">Nama Ketua Umum</label>
                <div className="relative">
                  <div 
                    className="w-full h-10 px-3 rounded-xl border border-[var(--theme-border)] bg-white text-sm text-[var(--theme-text)] flex items-center justify-between cursor-pointer"
                    onClick={() => setIsStudentDropdownOpen(!isStudentDropdownOpen)}
                  >
                    <span className={`truncate ${!formData.ketua_nama ? 'text-[var(--theme-text-subtle)]' : ''}`}>{formData.ketua_nama || '-- Pilih Mahasiswa --'}</span>
                    <span className="material-symbols-outlined text-[var(--theme-text-subtle)]">expand_more</span>
                  </div>
                  
                  {isStudentDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-[var(--theme-border)] rounded-xl shadow-lg max-h-60 overflow-y-auto overflow-x-hidden">
                      <div className="sticky top-0 bg-white p-2 border-b border-[var(--theme-border-muted)]">
                        <input 
                          type="text" 
                          placeholder="Cari nama atau NIM..." 
                          value={studentSearch}
                          onChange={e => setStudentSearch(e.target.value)}
                          className="w-full h-9 px-3 rounded-lg bg-[var(--theme-bg)] border border-[var(--theme-border)] text-sm focus:outline-none focus:border-[var(--theme-primary)]"
                          onClick={e => e.stopPropagation()}
                        />
                      </div>
                      <div className="p-1">
                        {filteredStudents.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-[var(--theme-text-muted)] text-center">Tidak ada mahasiswa ditemukan</div>
                        ) : (
                          filteredStudents.slice(0, 50).map(s => (
                            <div 
                              key={s.ID}
                              onClick={() => {
                                set('ketua_nama', s.Nama)
                                setIsStudentDropdownOpen(false)
                                setStudentSearch('')
                              }}
                              className={`px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-[var(--theme-primary-light)] hover:text-[var(--theme-primary)] ${formData.ketua_nama === s.Nama ? 'bg-[var(--theme-primary-light)] text-[var(--theme-primary)] font-semibold' : 'text-[var(--theme-text)]'}`}
                            >
                              {s.Nama} <span className="text-[var(--theme-text-muted)] ml-1">({s.NIM})</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">Jumlah Anggota</label>
                <input 
                  type="number" 
                  value={formData.jumlah_anggota} 
                  onChange={e => set('jumlah_anggota', parseInt(e.target.value) || 0)} 
                  className="h-10 w-full rounded-xl border border-[var(--theme-border)] bg-white px-3 text-sm text-[var(--theme-text)] placeholder:text-[var(--theme-text-subtle)] focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:outline-none transition-colors" 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">Status</label>
                <Select value={formData.status} onValueChange={val => set('status', val)}>
                  <SelectTrigger className="h-10 w-full rounded-xl border border-[var(--theme-border)] bg-white px-3 text-sm text-[var(--theme-text)] focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:outline-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border border-[var(--theme-border)] shadow-md bg-white">
                    {['Aktif', 'Nonaktif', 'Pembekuan'].map(v => (
                      <SelectItem key={v} value={v} className="rounded-lg text-sm py-1.5 focus:bg-[var(--theme-primary-light)] focus:text-[var(--theme-primary)]">
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">Email Resmi</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={e => set('email', e.target.value)} 
                  placeholder="info@ormawa.com" 
                  className="h-10 w-full rounded-xl border border-[var(--theme-border)] bg-white px-3 text-sm text-[var(--theme-text)] placeholder:text-[var(--theme-text-subtle)] focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:outline-none transition-colors" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">{editingOrg ? 'Password (kosongkan jika tidak diubah)' : 'Password Akun Admin'}</label>
              <input 
                type="password" 
                value={formData.password} 
                onChange={e => set('password', e.target.value)} 
                placeholder="Password login admin ormawa..." 
                required={!editingOrg} 
                className="h-10 w-full rounded-xl border border-[var(--theme-border)] bg-white px-3 text-sm text-[var(--theme-text)] placeholder:text-[var(--theme-text-subtle)] focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:outline-none transition-colors" 
              />
            </div>
          </DialogContent>
          <DialogFooter>
            <button 
              type="button" 
              onClick={() => setModal(false)} 
              className="h-10 px-4 rounded-xl border border-[var(--theme-border)] text-sm font-semibold text-[var(--theme-text)] hover:bg-[var(--theme-bg)] transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="h-10 px-4 rounded-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white text-sm font-semibold transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span className="material-symbols-outlined animate-spin text-[14px]">sync</span>
              ) : (
                <span className="material-symbols-outlined text-[14px]">save</span>
              )}{' '}
              {editingOrg ? 'Update Data' : 'Simpan Data'}
            </button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Delete Confirm */}
      <DeleteConfirmModal
        isOpen={!!delTarget}
        onClose={() => setDelTarget(null)}
        onConfirm={handleDelete}
        isDeleting={isSubmitting}
        title="Hapus Organisasi?"
        message={`Tindakan ini tidak dapat dibatalkan. Pastikan tidak ada data kepengurusan, berkas proposal, atau laporan aktif yang masih terkait dengan organisasi "${delTarget?.nama}" ini.`}
      />
    </PageContent>
  )
}

"use client"

import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { toast, Toaster } from 'react-hot-toast'

import { cn } from '@/lib/utils'
import { API_BASE_URL } from '../../services/api'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./components/select"
import { Button } from "./components/button"

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Users2 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>groups</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const CheckCircle2 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>check_circle</span>;
const ShieldCheck = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>verified_user</span>;



const API = "/faculty"
const EMPTY_FORM = { kode_org:'', nama_org:'', ketua_nama:'', jumlah_anggota:0, status:'Aktif', kategori:'Himpunan', email:'', password:'', phone:'' }

export default function FacultyOrganisasi() {
  const [organizations, setOrgs] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setModal]   = useState(false)
  const [editingOrg, setEdit]   = useState(null)
  const [isSubmitting, setIsSub]= useState(false)
  const [delTarget, setDelTarget]= useState(null)
  const [search, setSearch]     = useState('')
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [currentPage, setCurrentPage]   = useState(1)
  const [pageSize, setPageSize]         = useState(10)
  const [sortConfig, setSortConfig]     = useState({ key: 'kode', direction: 'asc' })

  const fetchData = async () => {
    setLoading(true)
    try {
      const res  = await axios.get(`${API}/organizations`)
      const data = res.data
      const mapped = Array.isArray(data.data) ? data.data.map(item=>({
        id: item.ID, nama: item.Nama, kode: item.Singkatan||item.Kode||'',
        status: item.Status||'Aktif', kategori: item.Kategori||'',
        jumlah_anggota: item.JumlahAnggota||0, deskripsi: item.Deskripsi||'',
        email: item.Email||'', phone: item.Phone||''
      })) : []
      setOrgs(mapped)
    } catch { toast.error('Gagal mengambil data organisasi') }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setIsSub(true)
    const payload = { Nama:formData.nama_org, Singkatan:formData.kode_org, Status:formData.status, Kategori:formData.kategori, JumlahAnggota:formData.jumlah_anggota, Deskripsi:formData.ketua_nama, Email:formData.email, Password:formData.password, Phone:formData.phone }
    try {
      if (editingOrg) { await axios.put(`${API}/organizations/${editingOrg.id}`, payload); toast.success('Organisasi diperbarui') }
      else { await axios.post(`${API}/organizations`, payload); toast.success('Organisasi ditambahkan') }
      setModal(false); fetchData()
    } catch (e) { toast.error(`Gagal menyimpan: ${e.response?.data?.message||'Error'}`) }
    finally { setIsSub(false) }
  }

  const handleDelete = async () => {
    if (!delTarget) return; setIsSub(true)
    try {
      const res = await axios.delete(`${API}/organizations/${delTarget.id}`)
      if (res.data.status==='success') { toast.success('Organisasi dihapus'); setDelTarget(null); fetchData() }
      else toast.error(res.data.message||'Gagal hapus')
    } catch (e) { toast.error(e.response?.data?.message||'Gagal menghapus') }
    finally { setIsSub(false) }
  }

  const openEdit = (org) => { setEdit(org); setFormData({ kode_org:org.kode, nama_org:org.nama, ketua_nama:org.deskripsi, jumlah_anggota:org.jumlah_anggota, status:org.status, kategori:org.kategori, email:org.email, password:'', phone:org.phone }); setModal(true) }
  const set = (k,v) => setFormData(p=>({...p,[k]:v}))

  useEffect(()=>{ fetchData() },[])

  const filtered = useMemo(()=>organizations.filter(o=>{
    const q=search.toLowerCase()
    return !q||o.nama?.toLowerCase().includes(q)||o.kode?.toLowerCase().includes(q)
  }),[organizations,search])

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

  const stats = { total:organizations.length, aktif:organizations.filter(o=>o.status==='Aktif').length, anggota:organizations.reduce((a,o)=>a+(o.jumlah_anggota||0),0) }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body">
      <Toaster position="top-right"/>
      <div className="max-w-[1600px] mx-auto px-4 py-8 md:px-8 xl:px-12 space-y-6">
        {/* Header */}
        <section className="relative overflow-hidden rounded-3xl h-auto md:h-48 flex flex-col md:flex-row items-center group shadow-sm p-6 md:p-8 border border-slate-200/80 bg-white">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/50 to-slate-100/50" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, black 1px, transparent 1px), radial-gradient(circle at 80% 20%, black 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }}
          />
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 right-40 w-48 h-48 bg-blue-400/5 rounded-full blur-2xl" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-1.5 bg-primary rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Master Data ORMAWA</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 font-headline tracking-tight leading-tight">
                Organisasi <span className="text-primary">Fakultas</span>
              </h1>
              <p className="text-slate-500 font-medium text-sm max-w-xl leading-relaxed mt-1">
                Kelola data legalitas dan identitas organisasi mahasiswa di lingkungan fakultas.
              </p>
            </div>
            <button onClick={()=>{ setEdit(null); setFormData(EMPTY_FORM); setModal(true) }}
              className="h-11 px-5 rounded-xl bg-primary hover:bg-[#001a52] text-white text-xs font-bold uppercase tracking-widest gap-2 flex items-center transition-all active:scale-95 shadow-lg shadow-[#00236F]/20 shrink-0">
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }} >add</span> Tambah ORMAWA
            </button>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {label:'Total ORMAWA',    value:stats.total,   icon:Users2,      bg:'bg-[#eef4ff]',  color:'text-primary',   desc:'Organisasi terdaftar'},
            {label:'Organisasi Aktif',value:stats.aktif,   icon:CheckCircle2, bg:'bg-emerald-50', color:'text-emerald-600', desc:'Status aktif beroperasi'},
            {label:'Total Anggota',   value:stats.anggota, icon:ShieldCheck, bg:'bg-indigo-50',  color:'text-indigo-600',  desc:'Jangkauan anggota'},
          ].map(s=>(
            <div key={s.label} className="bg-white border border-slate-100/50 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center',s.bg,s.color)}><s.icon size={18}/></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 leading-none tabular-nums">{loading?<span className="material-symbols-outlined animate-spin text-slate-300" style={{ fontSize: '18px' }} >sync</span>:s.value}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-100/50 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1">
              <h2 className="font-bold text-base text-slate-900">Daftar Organisasi Mahasiswa</h2>
              <p className="text-xs text-slate-500 mt-0.5">Menampilkan <span className="font-bold text-slate-900">{filtered.length}</span> dari <span className="font-bold text-primary">{organizations.length}</span> organisasi</p>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '14px' }} >search</span>
              <input type="text" placeholder="Cari nama atau kode..." value={search} onChange={e=>setSearch(e.target.value)}
                className="pl-9 pr-4 h-9 w-52 rounded-xl border border-slate-200/60 focus:outline-none focus:border-primary text-sm bg-white"/>
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
                {loading?Array.from({length: pageSize}).map((_,i)=>(
                  <tr key={i} className="border-b border-slate-100">{[...Array(7)].map((__,j)=><td key={j} className="px-5 py-4"><div className="h-4 bg-slate-50 rounded animate-pulse"/></td>)}</tr>
                )):paginated.length===0?(
                  <tr><td colSpan={7} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-[#eef4ff] rounded-2xl flex items-center justify-center text-primary"><span className="material-symbols-outlined" style={{ fontSize: '22px' }}>group</span></div>
                      <p className="font-bold text-sm text-slate-900">Belum Ada Organisasi</p>
                    </div>
                  </td></tr>
                ):paginated.map((row,i)=>(
                  <tr key={row.id||i} className="border-b border-[#f5f5f5] hover:bg-[#fafbff] transition-colors">
                    <td className="px-5 py-3.5"><span className="text-[10px] font-black text-slate-600 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg uppercase tracking-wider">{row.kode||'—'}</span></td>
                    <td className="px-5 py-3.5"><p className="font-bold text-sm text-slate-900">{row.nama}</p></td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 font-medium">{row.deskripsi||'—'}</td>
                    <td className="px-5 py-3.5"><span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">{row.kategori||'—'}</span></td>
                    <td className="px-5 py-3.5"><div className="flex items-center gap-1.5 text-sm font-black text-slate-900"><span className="material-symbols-outlined text-slate-400" style={{ fontSize: '12px' }}>group</span>{row.jumlah_anggota||0}</div></td>
                    <td className="px-5 py-3.5">
                      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase',
                        row.status==='Aktif'?'bg-emerald-50 text-emerald-700 border-emerald-200':'bg-rose-50 text-rose-700 border-rose-200')}>
                        <span className={cn('w-1.5 h-1.5 rounded-full',row.status==='Aktif'?'bg-emerald-500':'bg-rose-500')}/>{row.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button onClick={()=>openEdit(row)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '15px' }} >edit</span></button>
                        <button onClick={()=>setDelTarget(row)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '15px' }} >delete</span></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modern Pagination Footer */}
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
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
      </div>

      {/* Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={()=>setModal(false)}>
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl z-[101] flex flex-col overflow-hidden max-h-[90vh]" onClick={e=>e.stopPropagation()}>
            <div className="relative bg-gradient-to-br from-[#00236F] to-[#003db5] pt-6 pb-7 px-6 overflow-hidden flex-shrink-0">
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full pointer-events-none"/>
              <button onClick={()=>setModal(false)} className="absolute z-50 top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '15px' }} >close</span></button>
              <div className="relative z-10">
                <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.25em] mb-1">{editingOrg?'Edit Organisasi':'Registrasi Baru'}</p>
                <h2 className="text-xl font-extrabold text-white">{editingOrg?'Update Data ORMAWA':'Tambah Organisasi'}</h2>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-1.5">Kode Akronim</label>
                    <input value={formData.kode_org} onChange={e=>set('kode_org',e.target.value.toUpperCase())} placeholder="BEM-FT" required className="w-full h-11 px-4 rounded-xl border border-slate-200/60 bg-slate-50/50 text-sm font-black uppercase text-slate-900 focus:outline-none focus:border-primary focus:bg-white transition-all"/></div>
                  <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-1.5">Kategori</label>
                    <select value={formData.kategori} onChange={e=>set('kategori',e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200/60 bg-slate-50/50 text-sm font-medium text-slate-900 focus:outline-none focus:border-primary appearance-none">
                      {['BEM','Himpunan','UKM','Komunitas','Lainnya'].map(v=><option key={v} value={v}>{v}</option>)}
                    </select></div>
                </div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-1.5">Nama Panjang Organisasi</label>
                  <input value={formData.nama_org} onChange={e=>set('nama_org',e.target.value)} placeholder="Nama resmi organisasi..." required className="w-full h-11 px-4 rounded-xl border border-slate-200/60 bg-slate-50/50 text-sm font-medium text-slate-900 focus:outline-none focus:border-primary focus:bg-white transition-all"/></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-1.5">Nama Ketua Umum</label>
                    <input value={formData.ketua_nama} onChange={e=>set('ketua_nama',e.target.value)} placeholder="Nama Ketua..." required className="w-full h-11 px-4 rounded-xl border border-slate-200/60 bg-slate-50/50 text-sm font-medium text-slate-900 focus:outline-none focus:border-primary focus:bg-white transition-all"/></div>
                  <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-1.5">Jumlah Anggota</label>
                    <input type="number" value={formData.jumlah_anggota} onChange={e=>set('jumlah_anggota',parseInt(e.target.value)||0)} className="w-full h-11 px-4 rounded-xl border border-slate-200/60 bg-slate-50/50 text-sm font-black text-center text-slate-900 focus:outline-none focus:border-primary focus:bg-white transition-all"/></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-1.5">Status</label>
                    <select value={formData.status} onChange={e=>set('status',e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200/60 bg-slate-50/50 text-sm font-medium text-slate-900 focus:outline-none focus:border-primary appearance-none">
                      {['Aktif','Nonaktif','Pembekuan'].map(v=><option key={v} value={v}>{v}</option>)}
                    </select></div>
                  <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-1.5">Email Resmi</label>
                    <input type="email" value={formData.email} onChange={e=>set('email',e.target.value)} placeholder="info@ormawa.com" className="w-full h-11 px-4 rounded-xl border border-slate-200/60 bg-slate-50/50 text-sm font-medium text-slate-900 focus:outline-none focus:border-primary focus:bg-white transition-all"/></div>
                </div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-1.5">{editingOrg?'Password (kosongkan jika tidak diubah)':'Password Akun Admin'}</label>
                  <input type="password" value={formData.password} onChange={e=>set('password',e.target.value)} placeholder="Password login admin ormawa..." required={!editingOrg} className="w-full h-11 px-4 rounded-xl border border-slate-200/60 bg-slate-50/50 text-sm font-medium text-slate-900 focus:outline-none focus:border-primary focus:bg-white transition-all"/></div>
              </div>
              <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex gap-3 flex-shrink-0">
                <button type="button" onClick={()=>setModal(false)} className="flex-1 h-11 rounded-xl border border-slate-200/60 bg-white text-xs font-bold text-slate-600 uppercase tracking-widest hover:bg-slate-50 transition-all">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 h-11 rounded-xl bg-primary hover:bg-[#001a52] text-white text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-[#00236F]/20 disabled:opacity-60 flex items-center justify-center gap-2">
                  {isSubmitting?<span className="material-symbols-outlined animate-spin" style={{ fontSize: '14px' }} >sync</span>:<span className="material-symbols-outlined" style={{ fontSize: '14px' }} >save</span>} {editingOrg?'Update Data':'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {delTarget && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setDelTarget(null)}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-[24px] shadow-2xl z-[101] overflow-hidden border border-slate-100 p-8 animate-in zoom-in-95 duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-left">
              <h3 className="text-[20px] font-bold text-[#0f172a] mb-2 leading-tight">Hapus Organisasi?</h3>
              <p className="text-[13px] text-[#64748b] leading-relaxed mb-8">
                Tindakan ini tidak dapat dibatalkan. Pastikan tidak ada data kepengurusan, berkas proposal, atau laporan aktif yang masih terkait dengan organisasi <strong>"{delTarget.nama}"</strong> ini.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDelTarget(null)}
                  className="h-10 px-6 rounded-xl border border-[#cbd5e1] bg-white text-[11px] font-bold text-[#334155] uppercase tracking-wider hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="h-10 px-6 rounded-xl bg-[#ef4444] hover:bg-[#dc2626] text-white text-[11px] font-bold uppercase tracking-wider transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer border-none shadow-sm"
                >
                  {isSubmitting ? (
                    <span className="material-symbols-outlined animate-spin text-[12px]">sync</span>
                  ) : null}
                  <span>{isSubmitting ? "Processing..." : "YA, HAPUS"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

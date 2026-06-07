import React, { useState, useEffect, useMemo } from 'react'
import useAuthStore from '@/store/useAuthStore'
import axios from 'axios'
import { toast, Toaster } from 'react-hot-toast'

import { cn } from '@/lib/utils'
import { API_BASE_URL } from '../../services/api'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select"
import { Button } from "@/components/ui/Button"
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Users2 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>groups</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const CheckCircle2 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>check_circle</span>;
const ShieldCheck = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>verified_user</span>;



const API = "/faculty"
const EMPTY_FORM = { kode_org: '', nama_org: '', ketua_nama: '', KetuaID: null, jumlah_anggota: 0, status: 'Aktif', kategori: '', kategori_ormawa_id: null, email: '', password: '', phone: '', fakultas_id: '', program_studi_id: '' }

export default function FacultyOrganisasi() {
  const [organizations, setOrgs] = useState([])
  const [students, setStudents] = useState([])
  const [faculties, setFaculties] = useState([])
  const [prodis, setProdis] = useState([]) // all prodis from backend
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()
  const userRole = (user?.role || user?.Role || '').toLowerCase()
  const isSuperAdmin = userRole === 'super_admin' || userRole === 'kencana_admin'
  const facultyIdFromCtx = user?.fakultas_id || user?.FakultasID || null
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
  const [prodis, setProdis] = useState([])
  const [prodiSearch, setProdiSearch] = useState('')
  const [isProdiDropdownOpen, setIsProdiDropdownOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  // Kategori Ormawa — master data dinamis dari API
  const [kategoriList, setKategoriList] = useState([])

  // Filtered faculties for dropdown search
  const filteredFaculties = useMemo(() => {
    if (!fakultasSearch || fakultasSearch === '-- Tingkat Universitas --') return faculties
    return faculties.filter(f => (f.nama || f.Nama)?.toLowerCase().includes(fakultasSearch.toLowerCase()))
  }, [faculties, fakultasSearch])

  const filteredProdis = useMemo(() => {
    return prodis.filter(p => !prodiSearch || (p.nama || p.Nama)?.toLowerCase().includes(prodiSearch.toLowerCase()))
  }, [prodis, prodiSearch])

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const q = studentSearch.toLowerCase()
      return !q || s.Nama?.toLowerCase().includes(q) || s.NIM?.includes(q)
    })
  }, [students, studentSearch])

  // Universal ID extractor — handles both lowercase 'id' and uppercase 'ID'
  const getOrmId = (obj) => {
    if (!obj) return null
    return obj.id || obj.ID || obj['ID'] || null
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [orgRes, stdRes, katRes] = await Promise.all([
        axios.get(`${API}/organizations`),
        axios.get('/faculty/students'),
        axios.get(`${API}/ormawa-kategori`),
      ])
      const data = orgRes.data
      const mapped = Array.isArray(data.data) ? data.data.map(item => ({
        id: item.ID, nama: item.Nama, kode: item.Singkatan || item.Kode || '',
        status: item.Status || 'Aktif', kategori: item.Kategori || '',
        kategori_ormawa_id: item.kategori_ormawa_id || item.KategoriOrmawaID || null,
        kategori_detail: item.kategori_detail || null,
        jumlah_anggota: item.JumlahAnggota || 0, deskripsi: item.Deskripsi || '',
        email: item.Email || '', phone: item.Phone || ''
      })) : []
      setOrgs(mapped)
      setStudents(stdRes.data.data || [])
      setKategoriList(katRes.data.data || [])

      // Always fetch prodis (needed for Himpunan dropdown)
      const prodiRes = await axios.get('/faculty/majors')
      setProdis(prodiRes.data.data || [])

      if (isSuperAdmin) {
        const facRes = await axios.get('/admin/fakultas')
        setFaculties(facRes.data.data || [])
      }
    } catch { toast.error('Gagal mengambil data organisasi') }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSub(true)
    const payload = {
      Nama: formData.nama_org,
      Singkatan: formData.kode_org,
      Status: formData.status,
      Kategori: formData.kategori,
      JumlahAnggota: parseInt(formData.jumlah_anggota) || 0,
      Deskripsi: formData.deskripsi || '',
      Email: formData.email,
      Password: formData.password,
      Phone: formData.phone,
    }
    if (formData.KetuaID) {
      payload.KetuaID = parseInt(formData.KetuaID)
      payload.KetuaNama = formData.ketua_nama
    }
    // Gunakan kategori_ormawa_id untuk relasi dinamis
    if (formData.kategori_ormawa_id) payload.kategori_ormawa_id = parseInt(formData.kategori_ormawa_id)
    // Cek terafiliasi_fakultas dari master data kategori (dinamis)
    const selectedKat = kategoriList.find(k => k.id === parseInt(formData.kategori_ormawa_id))
    const isTerafiliasi = selectedKat?.terafiliasi_fakultas || false
    if (isTerafiliasi || (isSuperAdmin && formData.fakultas_id)) {
      if (formData.fakultas_id) payload.fakultas_id = parseInt(formData.fakultas_id)
      if (formData.program_studi_id) payload.program_studi_id = parseInt(formData.program_studi_id)
    }
    try {
      const targetId = getOrmId(editingOrg)
      console.log('[SUBMIT] targetId:', targetId, 'editingOrg:', editingOrg)
      if (!targetId && editingOrg) {
        toast.error('ID organisasi tidak ditemukan, coba refresh halaman.')
        return
      }
      if (editingOrg) {
        const putUrl = isSuperAdmin ? `/admin/ormawa/${targetId}` : `${API}/organizations/${targetId}`
        await axios.put(putUrl, payload)
        toast.success('Organisasi diperbarui')
      } else {
        const postUrl = isSuperAdmin ? `/admin/ormawa` : `${API}/organizations`
        await axios.post(postUrl, payload)
        toast.success('Organisasi ditambahkan')
      }
      closeModal(); fetchData()
    } catch (e) { toast.error(`Gagal menyimpan: ${e.response?.data?.message || e.message || 'Error'}`) }
    finally { setIsSub(false) }
  }

  const handleDelete = async () => {
    if (!delTarget) return
    setIsSub(true)
    const id = getOrmId(delTarget)
    console.log('[DELETE] id:', id, 'delTarget:', delTarget)
    if (!id) {
      toast.error('ID organisasi tidak ditemukan, coba refresh halaman.')
      setIsSub(false)
      return
    }
    try {
      // Super admin uses /admin/ormawa, faculty uses /faculty/organizations
      const delUrl = isSuperAdmin ? `/admin/ormawa/${id}` : `${API}/organizations/${id}`
      const res = await axios.delete(delUrl)
      if (res.data.status === 'success') { toast.success('Organisasi dihapus'); setDelTarget(null); fetchData() }
      else toast.error(res.data.message || 'Gagal hapus')
    } catch (e) { toast.error(e.response?.data?.message || 'Gagal menghapus') }
    finally { setIsSub(false) }
  }

  const openEdit = (org) => { 
    console.log('Open Edit ORMAWA:', org);
    setEdit(org); 
    setFormData({ kode_org: org.kode || org.Singkatan || '', nama_org: org.nama || org.Nama || '', ketua_nama: org.deskripsi || org.Deskripsi || org.ketua_nama || '', KetuaID: org.ketua_id || org.KetuaID || null, jumlah_anggota: org.jumlah_anggota || org.JumlahAnggota || 0, status: org.status || org.Status || 'Aktif', kategori: org.kategori || org.Kategori || '', kategori_ormawa_id: org.kategori_ormawa_id || null, email: org.email || org.Email || '', password: '', phone: org.phone || org.Phone || '', fakultas_id: org.fakultas_id || org.FakultasID || '', program_studi_id: org.program_studi_id || org.ProgramStudiID || '' }); 
    const facIdToFind = org.fakultas_id || org.FakultasID;
    const foundFac = faculties.find(f => (f.id || f.ID) === facIdToFind)
    setFakultasSearch(foundFac ? (foundFac.nama || foundFac.Nama) : '')
    // Cek terafiliasi dari kategori detail ormawa ini
    const katDetail = org.kategori_detail || kategoriList.find(k => k.id === (org.kategori_ormawa_id || org.KategoriOrmawaID))
    const isTerafiliasi = katDetail?.terafiliasi_fakultas || org.kategori === 'Himpunan'
    if (facIdToFind && isTerafiliasi) {
      axios.get(`/admin/prodi?fakultasId=${facIdToFind}`).then(r => {
        const prodiList = r.data.data || r.data || []
        setProdis(prodiList)
        const foundProdi = prodiList.find(p => (p.id || p.ID) === (org.program_studi_id || org.ProgramStudiID))
        setProdiSearch(foundProdi ? (foundProdi.nama || foundProdi.Nama) : '')
      }).catch(() => {})
    } else {
      setProdis([])
      setProdiSearch('')
    }
    setShowPassword(false)
    setModal(true) 
  }
  const set = (k, v) => setFormData(p => ({ ...p, [k]: v }))

  useEffect(() => { fetchData() }, [])

  // Auto-set fakultas untuk Faculty Admin saat kategori yang dipilih terafiliasi fakultas
  useEffect(() => {
    const selectedKat = kategoriList.find(k => k.id === parseInt(formData.kategori_ormawa_id))
    const isTerafiliasi = selectedKat?.terafiliasi_fakultas || formData.kategori === 'Himpunan'
    if (isTerafiliasi && !isSuperAdmin && facultyIdFromCtx && !formData.fakultas_id) {
      set('fakultas_id', facultyIdFromCtx)
      axios.get(`/admin/prodi?fakultasId=${facultyIdFromCtx}`)
        .then(r => setProdis(r.data.data || r.data || []))
        .catch(() => {})
    }
  }, [formData.kategori_ormawa_id, formData.kategori, showModal])

  const filtered = useMemo(() => organizations.filter(o => {
    const q = search.toLowerCase()
    return !q || (o.Nama || o.nama || '').toLowerCase().includes(q) ||
      (o.Singkatan || o.kode || '').toLowerCase().includes(q)
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

  const stats = {
    total: organizations.length,
    aktif: organizations.filter(o => (o.Status || o.status) === 'Aktif').length,
    anggota: organizations.reduce((a, o) => a + (o.JumlahAnggota || o.jumlah_anggota || 0), 0)
  }

  const kategoriData = useMemo(() => {
    const counts = {}
    organizations.forEach(o => {
      const k = o.Kategori || o.kategori || 'Lainnya'
      counts[k] = (counts[k] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [organizations])

  const topAnggotaData = useMemo(() => {
    return [...organizations]
      .sort((a, b) => (b.JumlahAnggota || b.jumlah_anggota || 0) - (a.JumlahAnggota || a.jumlah_anggota || 0))
      .slice(0, 10)
      .map(o => ({ name: o.Singkatan || o.kode || o.Nama || o.nama, value: o.JumlahAnggota || o.jumlah_anggota || 0 }))
  }, [organizations])

  const PIE_COLORS = ['#00236f', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#ec4899', '#14b8a6']

  // Pre-computed untuk menghindari IIFE dalam JSX (tidak didukung OXC parser Vite)
  const selectedKatDetail = kategoriList.find(k => k.id === parseInt(formData.kategori_ormawa_id))
  const isTerafiliasiKategori = selectedKatDetail?.terafiliasi_fakultas ||
    (!selectedKatDetail && formData.kategori === 'Himpunan')

  return (
    <div className="min-h-screen bg-transparent font-inter">
      <Toaster position="top-right" />
      <div className="w-full space-y-6">

        {/* ── Page Header ────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-2xl p-6 md:p-8 border border-slate-200/50 bg-white/70 backdrop-blur-md shadow-sm">
          {/* Subtle geometric grid background overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/40 to-slate-100/30" />
          <div className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, var(--theme-primary) 1px, transparent 1px), radial-gradient(circle at 80% 20%, var(--theme-primary) 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />
          {/* Accent glow blobs */}
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 right-40 w-48 h-48 bg-blue-400/5 rounded-full blur-2xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-4">
                {/* Clean visual anchor icon */}
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/[0.02] border border-primary/10 flex items-center justify-center text-primary shrink-0 shadow-sm relative overflow-hidden group/icon">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300" />
                  <span className="material-symbols-outlined text-primary relative z-10 transition-transform duration-300 group-hover/icon:scale-110" style={{ fontSize: '26px' }}>groups</span>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-primary/5 text-primary border border-primary/10">
                      Master Data ORMAWA
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {stats.aktif} ORMAWA Aktif
                    </span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-headline leading-none">
                    Organisasi <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Fakultas</span>
                  </h1>
                </div>
              </div>

              {/* Perfectly aligned description block */}
              <p className="text-slate-500 font-medium text-xs md:text-sm max-w-3xl leading-relaxed mt-3 pl-0 md:pl-[72px]">
                Kelola data legalitas dan identitas organisasi mahasiswa di lingkungan fakultas.
              </p>
            </div>

            {/* Action and quick count balance box */}
            <div className="flex flex-row lg:flex-col items-end gap-3 shrink-0 self-stretch lg:self-auto justify-between lg:justify-center border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
              <div className="flex items-center gap-2">
                <button onClick={() => { 
                  setEdit(null); 
                  const initFid = !isSuperAdmin && facultyIdFromCtx ? facultyIdFromCtx : ''
                  setFormData({ ...EMPTY_FORM, fakultas_id: initFid })
                  setFakultasSearch('')
                  setProdiSearch('')
                  setProdis([])
                  if (initFid) {
                    axios.get(`/admin/prodi?fakultasId=${initFid}`).then(r => setProdis(r.data.data || r.data || [])).catch(() => {})
                  }
                  setShowPassword(false); 
                  setModal(true) 
                }}
                  className="h-10 px-4 rounded-xl bg-primary hover:bg-bku-hover text-white text-xs font-bold uppercase tracking-wider gap-2 flex items-center transition-all active:scale-95 shadow-lg shadow-bku-primary/20 shrink-0">
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }} >add</span> Tambah ORMAWA
                </button>
              </div>
            </div>
          </div>
        </section>

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
                  const rowId = getOrmId(row)
                  const rowStatus = row.Status || row.status || 'Aktif'
                  return (
                    <tr key={rowId || i} className="border-b border-[#f5f5f5] hover:bg-[#fafbff] transition-colors">
                      <td className="px-5 py-3.5"><span className="text-[10px] font-black text-slate-600 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg uppercase tracking-wider">{row.Singkatan || row.kode || '—'}</span></td>
                      <td className="px-5 py-3.5"><p className="font-bold text-sm text-slate-900">{row.Nama || row.nama}</p></td>
                      <td className="px-5 py-3.5 text-sm text-slate-600 font-medium">{row.Deskripsi || row.deskripsi || '—'}</td>
                      <td className="px-5 py-3.5"><span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">{row.Kategori || row.kategori || '—'}</span></td>
                      <td className="px-5 py-3.5"><div className="flex items-center gap-1.5 text-sm font-black text-slate-900"><span className="material-symbols-outlined text-slate-400" style={{ fontSize: '12px' }}>group</span>{row.JumlahAnggota || row.jumlah_anggota || 0}</div></td>
                      <td className="px-5 py-3.5">
                        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase',
                          rowStatus === 'Aktif' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200')}>
                          <span className={cn('w-1.5 h-1.5 rounded-full', rowStatus === 'Aktif' ? 'bg-emerald-500' : 'bg-rose-500')} />{rowStatus}
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
      </div>

      {/* Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={closeModal}>
          <div className="relative w-full max-w-lg glass-card rounded-2xl shadow-none border border-slate-200/60 flex flex-col overflow-hidden max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="relative bg-gradient-to-br from-bku-primary to-[#003db5] pt-6 pb-7 px-6 overflow-hidden flex-shrink-0">
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full pointer-events-none" />
              <button onClick={closeModal} className="absolute z-50 top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '15px' }} >close</span></button>
              <div className="relative z-10">
                <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.25em] mb-1">{editingOrg ? 'Edit Organisasi' : 'Registrasi Baru'}</p>
                <h2 className="text-xl font-extrabold font-headline text-white">{editingOrg ? 'Update Data ORMAWA' : 'Tambah Organisasi'}</h2>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-1.5">Kode Akronim</label>
                    <input value={formData.kode_org} onChange={e => set('kode_org', e.target.value.toUpperCase())} placeholder="BEM-FT" required className="w-full h-11 px-4 rounded-xl border border-slate-200/60 bg-slate-50/50 text-sm font-black uppercase text-slate-900 focus:outline-none focus:border-primary focus:bg-white transition-all" /></div>
                  <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-1.5">Kategori</label>
                    <select
                      value={formData.kategori_ormawa_id || ''}
                      onChange={e => {
                        const katId = e.target.value ? parseInt(e.target.value) : null
                        const kat = kategoriList.find(k => k.id === katId)
                        set('kategori_ormawa_id', katId)
                        set('kategori', kat?.nama || '') // sync legacy field
                        // Reset fakultas/prodi jika tidak terafiliasi
                        if (!kat?.terafiliasi_fakultas) {
                          set('fakultas_id', '')
                          set('program_studi_id', '')
                          setProdis([])
                        } else if (!isSuperAdmin && facultyIdFromCtx) {
                          set('fakultas_id', facultyIdFromCtx)
                          axios.get(`/admin/prodi?fakultasId=${facultyIdFromCtx}`).then(r => setProdis(r.data.data || r.data || [])).catch(()=>{})
                        }
                      }}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200/60 bg-slate-50/50 text-sm font-medium text-slate-900 focus:outline-none focus:border-primary appearance-none"
                    >
                      <option value="">-- Pilih Kategori --</option>
                      {kategoriList.map(k => (
                        <option key={k.id} value={k.id}>
                          {k.nama}{k.terafiliasi_fakultas ? ' 🏛️' : ''}
                        </option>
                      ))}
                    </select>
                    {formData.kategori_ormawa_id && selectedKatDetail && (
                      <p className={`mt-1 text-[10px] font-bold ${selectedKatDetail.terafiliasi_fakultas ? 'text-blue-600' : 'text-emerald-600'}`}>
                        {selectedKatDetail.terafiliasi_fakultas
                          ? '🏛️ Proposal wajib melewati Fakultas terlebih dahulu'
                          : '✅ Proposal langsung ke Universitas'}
                      </p>
                    )}
                  </div>
                </div>

                {/* ── Pilih Fakultas + Prodi — tampil jika kategori terafiliasi_fakultas ── */}
                {isTerafiliasiKategori && (
                  <div className="space-y-3 p-3 rounded-xl border border-blue-100 bg-blue-50/50">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.18em]">
                      <span className="material-symbols-outlined text-[13px] align-middle mr-1">account_tree</span>
                      Afiliasi Fakultas &amp; Prodi — wajib untuk kategori ini
                    </p>

                    {/* Pilih Fakultas — dropdown untuk Super Admin, badge untuk Faculty Admin */}
                    {isSuperAdmin ? (
                      <div className="relative">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-1.5">Pilih Fakultas</label>
                        <div className="relative">
                          <div
                            className="w-full h-11 px-4 rounded-xl border border-slate-200/60 bg-white text-sm font-medium text-slate-900 flex items-center justify-between cursor-pointer"
                            onClick={() => setIsFakultasDropdownOpen(!isFakultasDropdownOpen)}
                          >
                            <span className={`truncate ${!formData.fakultas_id ? 'text-slate-400' : ''}`}>{fakultasSearch || '-- Pilih Fakultas --'}</span>
                            <span className="material-symbols-outlined text-slate-400">expand_more</span>
                          </div>
                          {isFakultasDropdownOpen && (
                            <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto overflow-x-hidden">
                              <div className="sticky top-0 bg-white p-2 border-b border-slate-100">
                                <input
                                  type="text"
                                  placeholder="Cari fakultas..."
                                  value={fakultasSearch === '-- Pilih Fakultas --' ? '' : fakultasSearch}
                                  onChange={e => setFakultasSearch(e.target.value)}
                                  className="w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-primary"
                                  onClick={e => e.stopPropagation()}
                                />
                              </div>
                              <div className="p-1">
                                <div
                                  onMouseDown={e => e.preventDefault()}
                                  onClick={() => { set('fakultas_id', ''); set('program_studi_id', ''); setFakultasSearch(''); setProdiSearch(''); setProdis([]); setIsFakultasDropdownOpen(false) }}
                                  className={`px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-slate-50 ${!formData.fakultas_id ? 'bg-primary/10 text-primary font-bold' : 'text-slate-500'}`}
                                >
                                  -- Pilih Fakultas --
                                </div>
                                {filteredFaculties.length === 0 ? (
                                  <div className="px-3 py-2 text-sm text-slate-400 text-center">Tidak ada fakultas ditemukan</div>
                                ) : (
                                  filteredFaculties.map(f => (
                                    <div
                                      key={f.id || f.ID}
                                      onMouseDown={e => e.preventDefault()}
                                      onClick={() => {
                                        const fid = f.id || f.ID
                                        set('fakultas_id', fid)
                                        set('program_studi_id', '')
                                        setFakultasSearch(f.nama || f.Nama)
                                        setProdiSearch('')
                                        setIsFakultasDropdownOpen(false)
                                        axios.get(`/admin/prodi?fakultasId=${fid}`).then(r => {
                                          setProdis(r.data.data || r.data || [])
                                        }).catch(() => setProdis([]))
                                      }}
                                      className={`px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-slate-50 ${parseInt(formData.fakultas_id) === (f.id || f.ID) ? 'bg-primary/10 text-primary font-bold' : 'text-slate-700'}`}
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
                    ) : (
                      /* Faculty Admin: Fakultas otomatis dari konteks login */
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-100/60 border border-blue-200">
                        <span className="material-symbols-outlined text-blue-600 text-[16px]">account_balance</span>
                        <div>
                          <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.15em]">Fakultas (otomatis dari akun Anda)</p>
                          <p className="text-sm font-bold text-blue-800">
                            {faculties.find(f => (f.id || f.ID) === (parseInt(formData.fakultas_id) || facultyIdFromCtx))?.nama ||
                             faculties.find(f => (f.id || f.ID) === facultyIdFromCtx)?.Nama ||
                             'Fakultas Anda'}
                          </p>
                        </div>
                      </div>
                    )}


                    {/* Pilih Prodi — muncul setelah Fakultas dipilih */}
                    {formData.fakultas_id && (
                      <div className="relative">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-1.5">Pilih Program Studi <span className="text-slate-300 normal-case font-medium">(opsional)</span></label>
                        <div className="relative">
                          <div 
                            className="w-full h-11 px-4 rounded-xl border border-slate-200/60 bg-white text-sm font-medium text-slate-900 flex items-center justify-between cursor-pointer"
                            onClick={() => setIsProdiDropdownOpen(!isProdiDropdownOpen)}
                          >
                            <span className={`truncate ${!formData.program_studi_id ? 'text-slate-400' : ''}`}>{prodiSearch || '-- Semua Prodi --'}</span>
                            <span className="material-symbols-outlined text-slate-400">expand_more</span>
                          </div>
                          
                          {isProdiDropdownOpen && (
                            <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto overflow-x-hidden">
                              <div className="sticky top-0 bg-white p-2 border-b border-slate-100">
                                <input 
                                  type="text" 
                                  placeholder="Cari program studi..." 
                                  value={prodiSearch}
                                  onChange={e => setProdiSearch(e.target.value)}
                                  className="w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-primary"
                                  onClick={e => e.stopPropagation()}
                                />
                              </div>
                              <div className="p-1">
                                <div 
                                  onMouseDown={e => e.preventDefault()}
                                  onClick={() => {
                                    set('program_studi_id', '')
                                    setProdiSearch('')
                                    setIsProdiDropdownOpen(false)
                                  }}
                                  className={`px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-slate-50 ${!formData.program_studi_id ? 'bg-primary/10 text-primary font-bold' : 'text-slate-500'}`}
                                >
                                  -- Semua Prodi --
                                </div>
                                {filteredProdis.length === 0 ? (
                                  <div className="px-3 py-2 text-sm text-slate-400 text-center">Tidak ada prodi ditemukan</div>
                                ) : (
                                  filteredProdis.map(p => (
                                    <div 
                                      key={p.id || p.ID}
                                      onMouseDown={e => e.preventDefault()}
                                      onClick={() => {
                                        set('program_studi_id', p.id || p.ID)
                                        setProdiSearch(p.nama || p.Nama)
                                        setIsProdiDropdownOpen(false)
                                      }}
                                      className={`px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-slate-50 ${parseInt(formData.program_studi_id) === (p.id || p.ID) ? 'bg-primary/10 text-primary font-bold' : 'text-slate-700'}`}
                                    >
                                      {p.nama || p.Nama}
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {/* Nama Panjang */}
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-1.5">Nama Panjang Organisasi</label>
                  <input value={formData.nama_org} onChange={e => set('nama_org', e.target.value)} placeholder="Nama resmi organisasi..." required className="w-full h-11 px-4 rounded-xl border border-slate-200/60 bg-slate-50/50 text-sm font-medium text-slate-900 focus:outline-none focus:border-primary focus:bg-white transition-all" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-1.5">Nama Ketua Umum</label>
                    <div className="relative">
                      <div 
                        className="w-full h-11 px-4 rounded-xl border border-slate-200/60 bg-slate-50/50 text-sm font-medium text-slate-900 flex items-center justify-between cursor-pointer"
                        onClick={() => setIsStudentDropdownOpen(!isStudentDropdownOpen)}
                      >
                        <span className={`truncate ${!formData.ketua_nama ? 'text-slate-500' : ''}`}>{formData.ketua_nama || '-- Pilih Mahasiswa --'}</span>
                        <span className="material-symbols-outlined text-slate-400">expand_more</span>
                      </div>
                      {isStudentDropdownOpen && (
                        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-y-auto overflow-x-hidden">
                          <div className="sticky top-0 bg-white p-2 border-b border-slate-100">
                            <input 
                              type="text" 
                              placeholder="Cari nama atau NIM..." 
                              value={studentSearch}
                              onChange={e => setStudentSearch(e.target.value)}
                              className="w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-primary"
                              onClick={e => e.stopPropagation()}
                            />
                          </div>
                          <div className="p-1">
                            {filteredStudents.length === 0 ? (
                              <div className="px-3 py-2 text-sm text-slate-400 text-center">Tidak ada mahasiswa ditemukan</div>
                            ) : (
                              filteredStudents.slice(0, 50).map(s => (
                                <div 
                                  key={s.ID}
                                  onClick={() => {
                                    set('ketua_nama', s.Nama)
                                    set('KetuaID', s.ID)
                                    setIsStudentDropdownOpen(false)
                                    setStudentSearch('')
                                  }}
                                  className={`px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-slate-50 ${formData.KetuaID === s.ID ? 'bg-primary/10 text-primary font-bold' : 'text-slate-700'}`}
                                >
                                  {s.Nama} <span className="text-slate-400 ml-1">({s.NIM})</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-1.5">Jumlah Anggota</label>
                    <input type="number" value={formData.jumlah_anggota} onChange={e => set('jumlah_anggota', parseInt(e.target.value) || 0)} className="w-full h-11 px-4 rounded-xl border border-slate-200/60 bg-slate-50/50 text-sm font-black text-center text-slate-900 focus:outline-none focus:border-primary focus:bg-white transition-all" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-1.5">Status</label>
                    <select value={formData.status} onChange={e => set('status', e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200/60 bg-slate-50/50 text-sm font-medium text-slate-900 focus:outline-none focus:border-primary appearance-none">
                      {['Aktif', 'Nonaktif', 'Pembekuan'].map(v => <option key={v} value={v}>{v}</option>)}
                    </select></div>
                  <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-1.5">Email Resmi</label>
                    <input type="email" value={formData.email} onChange={e => set('email', e.target.value)} placeholder="info@ormawa.com" className="w-full h-11 px-4 rounded-xl border border-slate-200/60 bg-slate-50/50 text-sm font-medium text-slate-900 focus:outline-none focus:border-primary focus:bg-white transition-all" /></div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-1.5">
                    {editingOrg ? 'Password (kosongkan jika tidak diubah)' : 'Password Akun Admin'}
                  </label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={formData.password} 
                      onChange={e => set('password', e.target.value)} 
                      placeholder="Password login admin ormawa..." 
                      required={!editingOrg} 
                      className="w-full h-11 pl-4 pr-12 rounded-xl border border-slate-200/60 bg-slate-50/50 text-sm font-medium text-slate-900 focus:outline-none focus:border-primary focus:bg-white transition-all" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="px-5 py-4 border-t border-slate-200/60 bg-transparent flex gap-3 flex-shrink-0">
                <button type="button" onClick={closeModal} className="flex-1 h-11 rounded-xl border border-slate-200/60 bg-white text-xs font-bold text-slate-600 uppercase tracking-widest hover:bg-slate-50 transition-all">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 h-11 rounded-xl bg-primary hover:bg-bku-hover text-white text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-bku-primary/20 disabled:opacity-60 flex items-center justify-center gap-2">
                  {isSubmitting ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '14px' }} >sync</span> : <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >save</span>} {editingOrg ? 'Update Data' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      <DeleteConfirmModal
        isOpen={!!delTarget}
        onClose={() => setDelTarget(null)}
        onConfirm={handleDelete}
        isDeleting={isSubmitting}
        title="Hapus Organisasi?"
        message={`Tindakan ini tidak dapat dibatalkan. Pastikan tidak ada data kepengurusan, berkas proposal, atau laporan aktif yang masih terkait dengan organisasi "${delTarget?.Nama || delTarget?.nama}" ini.`}
      />
    </div>
  )
}

"use client"

import React, { useState, useEffect, useMemo } from 'react'
import api from '../../lib/axios'
import { toast, Toaster } from 'react-hot-toast'

import { cn } from '@/lib/utils'
import { API_BASE_URL } from '../../services/api'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./components/select"
import { Button } from "./components/button"

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Download = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>download</span>;
const ExternalLink = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>open_in_new</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const RefreshCw = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>sync</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Mail = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>mail</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const CheckCircle2 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>check_circle</span>;



const API = `${API_BASE_URL}/faculty`

const AVATAR_COLORS = ['from-blue-400 to-indigo-500','from-emerald-400 to-teal-500','from-amber-400 to-orange-500','from-rose-400 to-pink-500','from-violet-400 to-purple-500']
const getInitials = (n='') => n.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase()||'?'
const formatDate = (d) => { try { return new Date(d).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}) } catch { return d } }

const getFullUrl = (path) => {
  if (!path || path.trim() === "" || path === "/" || path.endsWith("/profiles/") || path.endsWith("/students/")) return null;
  if (path.startsWith('http')) return path;
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}${path}`;
}

function StudentAvatar({ src, name, className = "w-9 h-9 rounded-xl" }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  const hasNoImage = !src || src.trim() === "" || src.endsWith("/profiles/") || src.endsWith("/students/") || src.endsWith("localhost:8000") || src.endsWith("localhost:8000/");

  return (
    <div className={cn("relative bg-slate-50 flex items-center justify-center shrink-0 border border-slate-200/40 shadow-inner overflow-hidden", className)}>
      {(!loaded || error || hasNoImage) && (
        <span className="material-symbols-outlined text-slate-400/80 block select-none leading-none absolute" style={{ fontSize: className.includes('w-14') ? '28px' : '20px' }}>
          person
        </span>
      )}
      {!hasNoImage && !error && (
        <img
          src={src}
          alt={name}
          className={cn("absolute inset-0 w-full h-full object-cover transition-opacity duration-200", loaded ? "opacity-100" : "opacity-0")}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}

const SURAT_STATUS = {
  diajukan:   {cls:'bg-amber-50 text-amber-700 border-amber-200',  dot:'bg-amber-500',  label:'Antrean'},
  diproses:   {cls:'bg-blue-50 text-blue-700 border-blue-200',     dot:'bg-blue-500',   label:'Diproses'},
  siap_ambil: {cls:'bg-sky-50 text-sky-700 border-sky-200',        dot:'bg-sky-500',    label:'Siap Ambil'},
  selesai:    {cls:'bg-emerald-50 text-emerald-700 border-emerald-200', dot:'bg-emerald-500', label:'Selesai'},
  ditolak:    {cls:'bg-rose-50 text-rose-700 border-rose-200',     dot:'bg-rose-500',   label:'Ditolak'},
}
const getStatus = (v='') => SURAT_STATUS[(v||'diajukan').toLowerCase()] || SURAT_STATUS.diajukan

export default function FacultyPersuratan() {
  const [requests, setRequests]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState(null)
  const [isSubmitting, setIsSub]  = useState(false)
  const [search, setSearch]       = useState('')
  const [filterStatus, setFilter] = useState('all')
  const [adminData, setAdminData] = useState({ status:'diproses', catatan_admin:'', file_url:'' })
  const [currentPage, setCurrentPage]   = useState(1)
  const [pageSize, setPageSize]         = useState(10)
  const [sortConfig, setSortConfig]     = useState({ key: 'CreatedAt', direction: 'desc' })

  const downloadPDF = (title, subtitle, contentHtml) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) { toast.error('Gagal membuka jendela cetak. Pastikan pop-up tidak diblokir.'); return; }
    const htmlContent = `<html><head><meta charset="utf-8"><title>${title}</title><style>
      @page { size: A4 landscape; margin: 15mm; }
      body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.5; color: #334155; background:#fff; margin:0; padding:0; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
      .letterhead-table { width:100%; border-collapse:collapse; border:none; margin-bottom:20px; }
      .letterhead-table td { border:none; padding:0; }
      .univ-title { font-size:12px; font-weight:700; color:#00236F; font-family:'Times New Roman',serif; }
      .univ-main  { font-size:17px; font-weight:800; color:#00236F; font-family:'Times New Roman',serif; margin-top:2px; }
      .univ-address { font-size:8px; color:#475569; margin-top:4px; }
      .univ-contact { font-size:8px; color:#00236F; font-weight:600; margin-top:2px; }
      .double-line { border:0; border-top:3px double #00236F; margin:10px 0 18px; }
      h1 { color:#1e293b; text-align:center; font-size:14px; font-weight:800; margin:0 0 3px; text-transform:uppercase; }
      h2 { color:#64748b; text-align:center; font-size:8px; font-weight:700; margin:0 0 20px; text-transform:uppercase; letter-spacing:1px; }
      table.data-table { width:100%; border-collapse:collapse; margin-top:8px; }
      table.data-table th { background:#00236F; color:#fff; font-weight:700; text-align:left; padding:7px 8px; border:1px solid #cbd5e1; font-size:8px; text-transform:uppercase; }
      table.data-table td { padding:6px 8px; border:1px solid #cbd5e1; font-size:8px; color:#334155; }
      table.data-table tr:nth-child(even) td { background:#f8fafc; }
      .badge { display:inline-block; padding:2px 5px; font-size:7px; font-weight:700; border-radius:3px; text-transform:uppercase; }
      .badge-amber  { background:#fef9c3; color:#a16207; border:1px solid #fef08a; }
      .badge-blue   { background:#dbeafe; color:#1d4ed8; border:1px solid #bfdbfe; }
      .badge-sky    { background:#e0f2fe; color:#0284c7; border:1px solid #bae6fd; }
      .badge-green  { background:#dcfce7; color:#15803d; border:1px solid #bbf7d0; }
      .badge-red    { background:#fee2e2; color:#b91c1c; border:1px solid #fecaca; }
      .footer { margin-top:30px; text-align:right; font-size:8px; color:#64748b; }
      .sig-line { width:150px; border-top:1px solid #94a3b8; margin-top:40px; display:inline-block; }
      @media print { .no-print { display:none; } }
    </style></head><body>
      <table class="letterhead-table"><tr>
        <td style="width:12%;text-align:left;">
          <img src="https://bku.ac.id/wp-content/uploads/2021/01/logo-bku-nav.png" alt="Logo" style="height:50px;width:auto;object-fit:contain;" onerror="this.src='https://bku.ac.id/wp-content/uploads/2021/01/logo-bku.png';this.onerror=null;"/>
        </td>
        <td style="width:88%;text-align:center;">
          <div class="univ-title">YAYASAN ADHI GUNA KENCANA</div>
          <div class="univ-main">UNIVERSITAS BHAKTI KENCANA</div>
          <div class="univ-address">Jl. Soekarno Hatta No. 754, Cipadung Kidul, Panyileukan, Kota Bandung, Jawa Barat 40614</div>
          <div class="univ-contact">Telp: (022) 7800570 | Email: info@bku.ac.id | Website: www.bku.ac.id</div>
        </td>
      </tr></table>
      <hr class="double-line" />
      <h1>${title}</h1>
      <h2>${subtitle}</h2>
      ${contentHtml}
      <div class="footer">
        <p>Dicetak secara otomatis oleh Portal Akademik Fakultas</p>
        <p>Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })} WIB</p>
        <br/><p>Mengetahui,</p>
        <p style="font-weight:700;margin-top:4px;">Kepala Administrasi Akademik</p>
        <div class="sig-line"></div>
      </div>
      <script>window.onload=function(){setTimeout(function(){window.print();setTimeout(function(){window.close();},100);},300);};<\/script>
    </body></html>`;
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const exportSuratPDF = () => {
    if (requests.length === 0) { toast.error('Tidak ada data pengajuan surat untuk diekspor'); return; }
    const dataToExport = filtered.length > 0 && filtered.length < requests.length ? filtered : requests;
    const statusBadge = (s) => {
      const m = { diajukan:'amber', diproses:'blue', siap_ambil:'sky', selesai:'green', ditolak:'red' };
      const labels = { diajukan:'Antrean', diproses:'Diproses', siap_ambil:'Siap Ambil', selesai:'Selesai', ditolak:'Ditolak' };
      const key = (s||'diajukan').toLowerCase();
      return `<span class="badge badge-${m[key]||'amber'}">${labels[key]||s}</span>`;
    };
    let tableRows = '';
    dataToExport.forEach((item, idx) => {
      tableRows += `<tr>
        <td style="font-family:monospace;font-weight:700;color:#00236F;">#${item.ID}</td>
        <td style="font-weight:700;">${item.Mahasiswa?.Nama||'—'}<br/><span style="font-size:7px;color:#64748b;">NIM: ${item.Mahasiswa?.NIM||'—'}</span></td>
        <td style="font-weight:700;">${item.Jenis||'—'}</td>
        <td style="color:#475569;font-style:italic;">${(item.Catatan||'—').length > 60 ? item.Catatan.substring(0, 60) + '...' : (item.Catatan||'—')}</td>
        <td>${statusBadge(item.Status)}</td>
        <td style="color:#64748b;">${item.CreatedAt ? new Date(item.CreatedAt).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' }) : '—'}</td>
      </tr>`;
    });
    const selesai = dataToExport.filter(r => r.Status === 'selesai').length;
    const proses  = dataToExport.filter(r => r.Status === 'diproses').length;
    const contentHtml = `
      <table style="width:100%;border-collapse:collapse;border:none;margin-bottom:16px;">
        <tr>
          <td style="padding:0 6px 0 0;width:33%;">
            <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:10px 12px;border-radius:5px;">
              <div style="font-size:7px;font-weight:700;color:#64748b;text-transform:uppercase;">Total Data Diekspor</div>
              <div style="font-size:14px;font-weight:700;color:#00236F;">${dataToExport.length} Pengajuan</div>
            </div>
          </td>
          <td style="padding:0 6px;width:33%;">
            <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:10px 12px;border-radius:5px;">
              <div style="font-size:7px;font-weight:700;color:#64748b;text-transform:uppercase;">Selesai Diterbitkan</div>
              <div style="font-size:14px;font-weight:700;color:#15803d;">${selesai} Surat</div>
            </div>
          </td>
          <td style="padding:0 0 0 6px;width:34%;">
            <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:10px 12px;border-radius:5px;">
              <div style="font-size:7px;font-weight:700;color:#64748b;text-transform:uppercase;">Dalam Pengerjaan</div>
              <div style="font-size:14px;font-weight:700;color:#d97706;">${proses} Surat</div>
            </div>
          </td>
        </tr>
      </table>
      <table class="data-table">
        <thead><tr>
          <th style="width:7%;">Ref</th>
          <th style="width:22%;">Mahasiswa</th>
          <th style="width:20%;">Jenis Surat</th>
          <th style="width:28%;">Catatan Pengajuan</th>
          <th style="width:11%;">Status</th>
          <th style="width:12%;">Tanggal</th>
        </tr></thead>
        <tbody>${tableRows}</tbody>
      </table>`;
    downloadPDF(
      'Rekapitulasi Pengajuan Surat Resmi Mahasiswa',
      `Laporan Antrean E-Persuratan Fakultas — ${new Date().toLocaleDateString('id-ID', { month:'long', year:'numeric' })}`,
      contentHtml
    );
    toast.success(`Berhasil mencetak ${dataToExport.length} data pengajuan surat!`);
  };

  const normalizeSurat = (r, i) => {
    const m = r.mahasiswa || r.Mahasiswa || {};
    return {
      ...r,
      ID: r.id || r.ID,
      Jenis: r.jenis || r.Jenis || '—',
      Catatan: r.catatan || r.Catatan || '—',
      Status: r.status || r.Status || 'diajukan',
      CreatedAt: r.created_at || r.CreatedAt,
      FileURL: r.file_url || r.FileURL || null,
      Mahasiswa: {
        Nama: m.nama || m.Nama || '—',
        NIM: m.nim || m.NIM || '—',
        Foto: getFullUrl(m.foto_url || m.FotoURL || m.foto || m.Foto || null),
      },
      colorIdx: i % AVATAR_COLORS.length,
    };
  }

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const res = await api.get('/faculty/surat')
      if (res.data.status === 'success') setRequests((res.data.data||[]).map(normalizeSurat))
    } catch { toast.error('Gagal mengambil data pengajuan surat') }
    finally { setLoading(false) }
  }

  const handleUpdate = async (e) => {
    if (e) e.preventDefault(); setIsSub(true)
    try {
      const res = await api.put(`/faculty/surat/${selected.ID}`, adminData)
      if (res.data.status === 'success') { toast.success('Status surat diperbarui'); setSelected(null); fetchRequests() }
      else toast.error(res.data.message||'Gagal update')
    } catch (err) { toast.error(err.response?.data?.message||'Server sibuk') }
    finally { setIsSub(false) }
  }

  useEffect(() => { fetchRequests() }, [])

  const filtered = useMemo(() => requests.filter(r => {
    const q = search.toLowerCase()
    const matchQ = !q || r.Mahasiswa?.Nama?.toLowerCase().includes(q) || r.Mahasiswa?.NIM?.includes(q) || r.Jenis?.toLowerCase().includes(q)
    const matchS = filterStatus==='all' || (r.Status||'diajukan').toLowerCase()===filterStatus
    return matchQ && matchS
  }), [requests, search, filterStatus])

  const sorted = useMemo(() => {
    let items = [...filtered]
    if (sortConfig.key !== null) {
      items.sort((a, b) => {
        let aVal, bVal;
        if (sortConfig.key === 'mahasiswa') {
          aVal = a.Mahasiswa?.Nama || ''
          bVal = b.Mahasiswa?.Nama || ''
        } else {
          aVal = a[sortConfig.key]
          bVal = b[sortConfig.key]
        }

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
    total:   requests.length,
    proses:  requests.filter(r=>r.Status==='diproses').length,
    selesai: requests.filter(r=>r.Status==='selesai').length,
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-body">
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
              <div className="flex items-center gap-2 mb-2"><div className="h-4 w-1.5 bg-primary rounded-full"/><span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">Administrasi Digital</span></div>
              <h1 className="text-3xl font-extrabold text-slate-900 font-headline tracking-tight">E-<span className="text-primary">Persuratan</span></h1>
              <p className="text-slate-500 font-medium text-sm max-w-xl leading-relaxed mt-1">Kelola antrean dan monitoring pengajuan surat resmi mahasiswa secara digital.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={exportSuratPDF} disabled={loading || requests.length === 0} className="h-11 px-5 rounded-xl border border-[#e5e5e5] bg-white text-xs font-bold uppercase tracking-widest text-[#525252] hover:bg-[#fafafa] gap-2 flex items-center transition-all active:scale-95 shadow-sm disabled:opacity-50">
                <Download size={14} className="text-primary"/> Ekspor PDF
              </button>
              <button onClick={fetchRequests} disabled={loading} className="h-11 px-5 rounded-xl border border-[#e5e5e5] bg-white text-xs font-bold uppercase tracking-widest text-[#525252] hover:bg-[#fafafa] gap-2 flex items-center transition-all active:scale-95 shadow-sm disabled:opacity-60">
                {loading?<span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '14px' }} >sync</span>:<RefreshCw size={14} className="text-primary"/>} Refresh
              </button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {label:'Total Antrean',  value:stats.total,   icon:Mail,         bg:'bg-[#eef4ff]',  color:'text-[#00236F]',   desc:'Semua pengajuan'},
            {label:'Sedang Proses',  value:stats.proses,  icon:RefreshCw,    bg:'bg-amber-50',   color:'text-amber-600',   desc:'Dalam pengerjaan'},
            {label:'Selesai Terbit', value:stats.selesai, icon:CheckCircle2, bg:'bg-emerald-50', color:'text-emerald-600', desc:'Dokumen diterbitkan'},
          ].map(s=>(
            <div key={s.label} className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center',s.bg,s.color)}><s.icon size={18}/></div>
                <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">{s.label}</span>
              </div>
              <p className="text-2xl font-extrabold text-[#171717] leading-none tabular-nums">{loading?<span className="material-symbols-outlined animate-spin text-slate-300" style={{ fontSize: '18px' }} >sync</span>:s.value}</p>
              <p className="text-xs text-[#a3a3a3] font-medium mt-1">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#f0f0f0] flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1">
              <h2 className="font-bold text-base text-[#171717]">Daftar Pengajuan Surat</h2>
              <p className="text-xs text-[#737373] mt-0.5">Menampilkan <span className="font-bold text-[#171717]">{filtered.length}</span> dari <span className="font-bold text-primary">{requests.length}</span> pengajuan</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a3a3]" style={{ fontSize: '14px' }} >search</span>
                <input type="text" placeholder="Cari nama, NIM, jenis surat..." value={search} onChange={e=>setSearch(e.target.value)}
                  className="pl-9 pr-4 h-9 w-52 rounded-xl border border-[#e5e5e5] focus:outline-none focus:border-primary text-sm bg-white"/>
              </div>
              <select value={filterStatus} onChange={e=>setFilter(e.target.value)}
                className="h-9 pl-3 pr-8 rounded-xl border border-[#e5e5e5] text-xs font-medium bg-white text-[#525252] focus:outline-none focus:border-primary appearance-none cursor-pointer">
                <option value="all">Semua Status</option>
                <option value="diajukan">Antrean</option>
                <option value="diproses">Proses</option>
                <option value="siap_ambil">Siap Ambil</option>
                <option value="selesai">Selesai</option>
                <option value="ditolak">Ditolak</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#e5e5e5]">
                  {[
                    { label: 'Ref', key: 'ID', sortable: true },
                    { label: 'Pengusul', key: 'mahasiswa', sortable: true },
                    { label: 'Jenis Surat', key: 'Jenis', sortable: true },
                    { label: 'Catatan', key: 'Catatan', sortable: true },
                    { label: 'Status', key: 'Status', sortable: true },
                    { label: 'Tanggal', key: 'CreatedAt', sortable: true },
                    { label: 'Aksi', key: null, sortable: false },
                  ].map(h => (
                    <th
                      key={h.label}
                      onClick={() => h.sortable && handleSort(h.key)}
                      className={cn(
                        'px-5 py-3.5 text-xs font-bold text-[#a3a3a3] uppercase tracking-wider whitespace-nowrap select-none',
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
                  <tr key={i} className="border-b border-[#f0f0f0]">{[...Array(7)].map((__,j)=><td key={j} className="px-5 py-4"><div className="h-4 bg-[#f5f5f5] rounded animate-pulse"/></td>)}</tr>
                )):paginated.length===0?(
                  <tr><td colSpan={7} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-[#eef4ff] rounded-2xl flex items-center justify-center text-primary"><span className="material-symbols-outlined" style={{ fontSize: '22px' }} >mail</span></div>
                      <p className="font-bold text-sm text-[#171717]">Tidak Ada Pengajuan</p>
                    </div>
                  </td></tr>
                ):paginated.map((row,i)=>{
                  const st = getStatus(row.Status)
                  return (
                    <tr key={row.ID||i} className="border-b border-[#f5f5f5] hover:bg-[#fafbff] transition-colors">
                      <td className="px-5 py-3.5"><span className="font-mono text-primary font-black text-[11px] tracking-widest">#{row.ID}</span></td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <StudentAvatar src={row.Mahasiswa?.Foto} name={row.Mahasiswa?.Nama} className="w-9 h-9 rounded-xl" />
                          <div><p className="font-bold text-sm text-[#171717]">{row.Mahasiswa?.Nama||'—'}</p><p className="text-[10px] text-[#a3a3a3] font-medium">{row.Mahasiswa?.NIM||'—'}</p></div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><p className="font-bold text-sm text-[#171717] max-w-[160px] truncate">{row.Jenis||'—'}</p></td>
                      <td className="px-5 py-3.5 max-w-[160px]"><p className="text-xs text-[#737373] italic line-clamp-1">"{row.Catatan||'—'}"</p></td>
                      <td className="px-5 py-3.5">
                        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider',st.cls)}>
                          <span className={cn('w-1.5 h-1.5 rounded-full',st.dot)}/>{st.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#737373] font-medium whitespace-nowrap">{formatDate(row.CreatedAt)}</td>
                      <td className="px-5 py-3.5">
                        <button onClick={()=>{setSelected(row);setAdminData({status:row.Status||'diproses',catatan_admin:row.Catatan||'',file_url:row.FileURL||''})}}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-primary bg-[#eef4ff] border border-[#c9d8ff] rounded-lg hover:bg-primary hover:text-white transition-all active:scale-95">
                          <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >security</span> Verify
                        </button>
                      </td>
                    </tr>
                  )
                })}
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

      {/* Action Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={()=>setSelected(null)}>
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl z-[101] flex flex-col overflow-hidden max-h-[90vh]" onClick={e=>e.stopPropagation()}>
            <div className="relative bg-gradient-to-br from-[#00236F] to-[#003db5] pt-6 pb-7 px-6 overflow-hidden flex-shrink-0">
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full pointer-events-none"/>
              <button onClick={()=>setSelected(null)} className="absolute z-50 top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '15px' }} >close</span></button>
              <div className="relative z-10">
                <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.25em] mb-1">#{selected.ID} · {selected.Mahasiswa?.Nama}</p>
                <h2 className="text-xl font-extrabold text-white">{selected.Jenis}</h2>
                <p className="text-xs text-blue-200 italic mt-1">"{selected.Catatan}"</p>
              </div>
            </div>
            <form onSubmit={handleUpdate} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div><label className="block text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.18em] mb-1.5">Status Progress Terkini</label>
                  <select value={adminData.status} onChange={e=>setAdminData(d=>({...d,status:e.target.value}))}
                    className="w-full h-11 px-4 rounded-xl border border-[#e5e5e5] bg-[#fafafa] text-sm font-medium text-[#171717] focus:outline-none focus:border-primary appearance-none">
                    <option value="diajukan">Diterima (Antrean)</option>
                    <option value="diproses">Sedang Diproses</option>
                    <option value="siap_ambil">Siap Diambil (Fisik)</option>
                    <option value="selesai">Selesai (Digital Terbit)</option>
                    <option value="ditolak">Tolak Pengajuan</option>
                  </select>
                </div>
                <div><label className="block text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.18em] mb-1.5">Link Lampiran Digital</label>
                  <div className="relative">
                    <input value={adminData.file_url} onChange={e=>setAdminData(d=>({...d,file_url:e.target.value}))} placeholder="https://drive.google.com/..."
                      className="w-full h-11 px-4 pr-11 rounded-xl border border-[#e5e5e5] bg-[#fafafa] text-sm font-medium text-[#171717] focus:outline-none focus:border-primary focus:bg-white transition-all"/>
                    <ExternalLink className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c4c4c4]" size={14}/>
                  </div>
                </div>
                <div><label className="block text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.18em] mb-1.5">Feedback Administratif</label>
                  <textarea value={adminData.catatan_admin} onChange={e=>setAdminData(d=>({...d,catatan_admin:e.target.value}))} rows={4}
                    placeholder="Informasikan detail pengambilan atau alasan penolakan..."
                    className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] bg-[#fafafa] focus:outline-none focus:border-primary focus:bg-white text-sm text-[#171717] transition-all resize-none"/>
                </div>
              </div>
              <div className="px-5 py-4 border-t border-[#f0f0f0] bg-[#fafafa] flex gap-3 flex-shrink-0">
                <button type="button" onClick={()=>setSelected(null)} className="flex-1 h-11 rounded-xl border border-[#e5e5e5] bg-white text-xs font-bold text-[#525252] uppercase tracking-widest hover:bg-[#f5f5f5] transition-all">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 h-11 rounded-xl bg-[#00236F] hover:bg-[#001a52] text-white text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-[#00236F]/20 disabled:opacity-60 flex items-center justify-center gap-2">
                  {isSubmitting?<span className="material-symbols-outlined animate-spin" style={{ fontSize: '14px' }} >sync</span>:<span className="material-symbols-outlined" style={{ fontSize: '14px' }} >check_circle</span>} Verifikasi & Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

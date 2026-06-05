"use client"

import React, { useState, useEffect, useMemo } from "react"

import { toast, Toaster } from "react-hot-toast"
import { cn } from "@/lib/utils"
import { API_BASE_URL } from "../../services/api"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./components/select"
import { Button } from "./components/button"

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Download = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>download</span>;
const RefreshCw = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>sync</span>;
const ExternalLink = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>open_in_new</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Trophy = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>emoji_events</span>;
const Star = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>star</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const CheckCircle2 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>check_circle</span>;
const Clock = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>schedule</span>;
const GraduationCap = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>school</span>;
const Award = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>emoji_events</span>;
const Calendar = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>calendar_today</span>;



const API = `${API_BASE_URL}/faculty`

const AVATAR_COLORS = [
  'from-blue-400 to-indigo-500','from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500','from-rose-400 to-pink-500',
  'from-violet-400 to-purple-500','from-cyan-400 to-sky-500',
]
const getInitials = (n='') => n.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase()||'?'

const STATUS_STYLES = {
  verified:     { cls:'bg-emerald-50 text-emerald-700 border-emerald-200', dot:'bg-emerald-500', label:'Terverifikasi' },
  terverifikasi:{ cls:'bg-emerald-50 text-emerald-700 border-emerald-200', dot:'bg-emerald-500', label:'Terverifikasi' },
  diverifikasi: { cls:'bg-emerald-50 text-emerald-700 border-emerald-200', dot:'bg-emerald-500', label:'Terverifikasi' },
  disetujui:    { cls:'bg-emerald-50 text-emerald-700 border-emerald-200', dot:'bg-emerald-500', label:'Disetujui' },
  rejected:     { cls:'bg-rose-50 text-rose-700 border-rose-200',         dot:'bg-rose-500',    label:'Ditolak' },
  ditolak:      { cls:'bg-rose-50 text-rose-700 border-rose-200',         dot:'bg-rose-500',    label:'Ditolak' },
  pending:      { cls:'bg-amber-50 text-amber-700 border-amber-200',      dot:'bg-amber-500',   label:'Menunggu' },
}
const getStatus = (val='') => STATUS_STYLES[val.toLowerCase()] || STATUS_STYLES.pending

const TINGKAT_STYLES = {
  internasional: 'bg-violet-50 text-violet-700 border-violet-200',
  nasional:      'bg-blue-50 text-blue-700 border-blue-200',
  regional:      'bg-cyan-50 text-cyan-700 border-cyan-200',
}

const formatDate = (d) => { try { return new Date(d).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}) } catch{return d} }

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

export default function FacultyPrestasi() {
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading]           = useState(true)
  const [selected, setSelected]         = useState(null)
  const [search, setSearch]             = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [currentPage, setCurrentPage]   = useState(1)
  const [filterSemester, setFilterSemester] = useState('all')
  const [filterPeriode, setFilterPeriode] = useState('all')
  const [filterProdi, setFilterProdi] = useState('all')
  const [pageSize, setPageSize]         = useState(10)
  const [sortConfig, setSortConfig]     = useState({ key: 'CreatedAt', direction: 'desc' })

  // Verification dialog states
  const [isVerifyOpen, setIsVerifyOpen] = useState(false)
  const [verifyStatus, setVerifyStatus] = useState("verified")
  const [verifyCatatan, setVerifyCatatan] = useState("")
  const [verifyPoin, setVerifyPoin] = useState(5)
  const [verifyDanaDisetujui, setVerifyDanaDisetujui] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      .badge-success { background:#dcfce7; color:#15803d; border:1px solid #bbf7d0; }
      .badge-warning { background:#fef9c3; color:#a16207; border:1px solid #fef08a; }
      .badge-info    { background:#dbeafe; color:#1d4ed8; border:1px solid #bfdbfe; }
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
        <p style="font-weight:700;margin-top:4px;">Dekan Bidang Akademik</p>
        <div class="sig-line"></div>
      </div>
      <script>window.onload=function(){setTimeout(function(){window.print();setTimeout(function(){window.close();},100);},300);};<\/script>
    </body></html>`;
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const exportAchievementsPDF = () => {
    if (achievements.length === 0) { toast.error('Tidak ada data prestasi untuk diekspor'); return; }
    const dataToExport = filtered.length > 0 && filtered.length < achievements.length ? filtered : achievements;
    let tableRows = '';
    dataToExport.forEach((item, idx) => {
      const stLabel = ['verified','terverifikasi','disetujui','diverifikasi'].includes((item.Status||'').toLowerCase())
        ? '<span class="badge badge-success">Terverifikasi</span>'
        : (item.Status||'').toLowerCase().includes('tolak') || (item.Status||'').toLowerCase() === 'rejected'
        ? '<span class="badge badge-warning">Ditolak</span>'
        : '<span class="badge badge-info">Menunggu</span>';
      const tingkatCls = (item.Tingkat||'').toLowerCase() === 'internasional' ? 'color:#7c3aed;font-weight:700;'
        : (item.Tingkat||'').toLowerCase() === 'nasional' ? 'color:#1d4ed8;font-weight:700;' : 'color:#0e7490;font-weight:700;';
      tableRows += `<tr>
        <td>${idx + 1}</td>
        <td style="font-weight:700;">${item.Mahasiswa?.Nama||'—'}<br/><span style="font-size:7px;color:#64748b;">NIM: ${item.Mahasiswa?.NIM||'—'}</span></td>
        <td>${item.NamaKegiatan||'—'}<br/><span style="font-size:7px;color:#1d4ed8;font-weight:700;">${item.Kategori||'Umum'}</span></td>
        <td style="${tingkatCls}">${item.Tingkat||'Lokal'}</td>
        <td>${item.Peringkat||'—'}</td>
        <td style="font-weight:700;text-align:center;">${item.Poin||0}</td>
        <td>${item.CreatedAt ? new Date(item.CreatedAt).getFullYear() : '—'}</td>
        <td>${stLabel}</td>
      </tr>`;
    });
    const totalVerified = dataToExport.filter(a => ['verified','terverifikasi','disetujui','diverifikasi'].includes((a.Status||'').toLowerCase())).length;
    const contentHtml = `
      <table style="width:100%;border-collapse:collapse;border:none;margin-bottom:16px;">
        <tr>
          <td style="padding:0 6px 0 0;width:33%;">
            <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:10px 12px;border-radius:5px;">
              <div style="font-size:7px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Total Data Diekspor</div>
              <div style="font-size:14px;font-weight:700;color:#00236F;">${dataToExport.length} Capaian</div>
            </div>
          </td>
          <td style="padding:0 6px;width:33%;">
            <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:10px 12px;border-radius:5px;">
              <div style="font-size:7px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Tervalidasi Fakultas</div>
              <div style="font-size:14px;font-weight:700;color:#15803d;">${totalVerified} Pengajuan</div>
            </div>
          </td>
          <td style="padding:0 0 0 6px;width:34%;">
            <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:10px 12px;border-radius:5px;">
              <div style="font-size:7px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Menunggu Review</div>
              <div style="font-size:14px;font-weight:700;color:#d97706;">${dataToExport.length - totalVerified} Pengajuan</div>
            </div>
          </td>
        </tr>
      </table>
      <table class="data-table">
        <thead><tr>
          <th style="width:4%;">No</th>
          <th style="width:20%;">Mahasiswa</th>
          <th style="width:28%;">Prestasi / Penghargaan</th>
          <th style="width:10%;">Tingkat</th>
          <th style="width:10%;">Peringkat</th>
          <th style="width:6%;text-align:center;">Poin</th>
          <th style="width:7%;">Tahun</th>
          <th style="width:10%;">Status</th>
        </tr></thead>
        <tbody>${tableRows}</tbody>
      </table>`;
    downloadPDF(
      'Laporan Prestasi & Capaian Mahasiswa',
      `Dataset Rekapitulasi Kompetisi Dan Penghargaan — ${new Date().toLocaleDateString('id-ID', { month:'long', year:'numeric' })}`,
      contentHtml
    );
    toast.success(`Berhasil mencetak ${dataToExport.length} data prestasi!`);
  };

  const fetchData = async () => {
    setLoading(true)
    try {
      const res  = await fetch(`${API}/prestasi`)
      const json = await res.json()
      if (json.status === 'success')
        setAchievements((json.data||[]).map((a,i)=>({
          ...a,
          Mahasiswa: a.mahasiswa || a.Mahasiswa,
          NamaKegiatan: a.nama_kegiatan || a.NamaKegiatan,
          Kategori: a.kategori || a.Kategori,
          Tingkat: a.tingkat || a.Tingkat,
          Peringkat: a.peringkat || a.Peringkat,
          Status: a.status || a.Status,
          Poin: a.poin || a.Poin,
          BuktiURL: a.bukti_url || a.BuktiURL,
          CreatedAt: a.created_at || a.CreatedAt,
          ID: a.id || a.ID,
          Tipe: a.tipe || a.Tipe || 'Laporan Prestasi',
          Penyelenggara: a.penyelenggara || a.Penyelenggara || '',
          Tanggal: a.tanggal || a.Tanggal || '',
          DanaDiajukan: a.dana_diajukan || a.DanaDiajukan || 0,
          DanaDisetujui: a.dana_disetujui || a.DanaDisetujui || 0,
          CatatanVerifikator: a.catatan_verifikator || a.CatatanVerifikator || '',
          semester_filter: (a.mahasiswa || a.Mahasiswa)?.SemesterSekarang || (a.mahasiswa || a.Mahasiswa)?.semester_sekarang ? String((a.mahasiswa || a.Mahasiswa)?.SemesterSekarang || (a.mahasiswa || a.Mahasiswa)?.semester_sekarang) : '',
          periode_filter: a.tanggal || a.Tanggal ? String(new Date(a.tanggal || a.Tanggal).getFullYear()) : (a.created_at || a.CreatedAt ? String(new Date(a.created_at || a.CreatedAt).getFullYear()) : ''),
          prodi_filter: (a.mahasiswa || a.Mahasiswa)?.ProgramStudi?.Nama || (a.mahasiswa || a.Mahasiswa)?.program_studi?.nama || '',
          colorIdx: i % AVATAR_COLORS.length
        })))
    } catch { toast.error('Gagal memuat data prestasi') }
    finally { setLoading(false) }
  }

  const handleOpenVerify = (row, status) => {
    setSelected(row)
    setVerifyStatus(status)
    const isFunding = (row.Tipe || row.tipe) === "Pengajuan Dana"
    setVerifyCatatan(status === "verified" ? (isFunding ? "Pengajuan dana disetujui." : "Prestasi tervalidasi oleh fakultas.") : "Berkas tidak sesuai kriteria.")
    setVerifyPoin(isFunding ? 0 : 5)
    setVerifyDanaDisetujui(isFunding ? String(row.DanaDiajukan || row.dana_diajukan || 0) : "")
    setIsVerifyOpen(true)
  }

  const handleVerifySubmit = async (e) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch(`${API}/prestasi/${selected.ID || selected.id}/verify`, {
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          Status: verifyStatus === 'verified' ? 'Diverifikasi' : 'Ditolak',
          Poin: Number(verifyPoin) || 0,
          Catatan: verifyCatatan,
          DanaDisetujui: Number(verifyDanaDisetujui) || 0
        })
      })
      const json = await res.json()
      if (json.status === 'success') {
        toast.success(verifyStatus === 'verified' ? 'Pengajuan disetujui! ✅' : 'Pengajuan ditolak ❌')
        setIsVerifyOpen(false)
        setSelected(null)
        fetchData()
      } else {
        toast.error(json.message || 'Gagal update status')
      }
    } catch {
      toast.error('Koneksi gagal saat menyimpan verifikasi')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const semesterOptions = useMemo(() => {
    const semesters = new Set()
    achievements.forEach(a => {
      if (a.semester_filter) semesters.add(a.semester_filter)
    })
    return Array.from(semesters).sort((a, b) => Number(a) - Number(b))
  }, [achievements])

  const periodeOptions = useMemo(() => {
    const periods = new Set()
    achievements.forEach(a => {
      if (a.periode_filter) periods.add(a.periode_filter)
    })
    return Array.from(periods).sort((a, b) => Number(b) - Number(a))
  }, [achievements])

  const prodiOptions = useMemo(() => {
    const prodis = new Set()
    achievements.forEach(a => {
      if (a.prodi_filter) prodis.add(a.prodi_filter)
    })
    return Array.from(prodis).sort()
  }, [achievements])

  const filtered = useMemo(() => achievements.filter(a => {
    const q = search.toLowerCase()
    const matchQ = !q || a.Mahasiswa?.Nama?.toLowerCase().includes(q) || a.NamaKegiatan?.toLowerCase().includes(q)
    const st = (a.Status||'').toLowerCase()
    const matchS = filterStatus==='all' || st===filterStatus || (filterStatus==='verified' && ['verified','terverifikasi','disetujui','diverifikasi'].includes(st))
    
    const matchSem = filterSemester === 'all' || a.semester_filter === filterSemester
    const matchPer = filterPeriode === 'all' || a.periode_filter === filterPeriode
    const matchPr = filterProdi === 'all' || a.prodi_filter === filterProdi

    return matchQ && matchS && matchSem && matchPer && matchPr
  }), [achievements, search, filterStatus, filterSemester, filterPeriode, filterProdi])

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
    total:     achievements.length,
    verified:  achievements.filter(a=>['verified','terverifikasi','disetujui','diverifikasi'].includes((a.Status||'').toLowerCase())).length,
    pending:   achievements.filter(a=>!['verified','terverifikasi','disetujui','diverifikasi','rejected','ditolak'].includes((a.Status||'').toLowerCase())).length,
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body">
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
                  <span className="material-symbols-outlined text-primary relative z-10 transition-transform duration-300 group-hover/icon:scale-110" style={{ fontSize: '26px' }}>emoji_events</span>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-primary/5 text-primary border border-primary/10">
                      Student Achievement
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {stats.total} Pengajuan Masuk
                    </span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-headline leading-none">
                    Validasi <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Prestasi</span>
                  </h1>
                </div>
              </div>

              {/* Perfectly aligned description block */}
              <p className="text-slate-500 font-medium text-xs md:text-sm max-w-3xl leading-relaxed mt-3 pl-0 md:pl-[72px]">
                Verifikasi dan validasi capaian mahasiswa dalam kompetisi akademik maupun non-akademik.
              </p>
            </div>

            {/* Action and quick count balance box */}
            <div className="flex flex-row lg:flex-col items-end gap-3 shrink-0 self-stretch lg:self-auto justify-between lg:justify-center border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
              <div className="flex items-center gap-2">
                <button onClick={exportAchievementsPDF} disabled={loading || achievements.length === 0}
                  className="h-10 px-4 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-sm text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-primary hover:border-primary/30 hover:bg-slate-50/50 shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-50 flex items-center gap-2">
                  <Download size={13} className="text-primary" /> Ekspor PDF
                </button>
                <button onClick={fetchData} disabled={loading}
                  className="h-10 px-4 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-sm text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-primary hover:border-primary/30 hover:bg-slate-50/50 shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-60 flex items-center gap-2">
                  {loading ? <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '13px' }} >sync</span> : <RefreshCw size={13} className="text-primary" />} Refresh Data
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label:'Total Pengajuan', value:stats.total,    icon:Trophy,       bg:'bg-[#eef4ff]',  color:'text-primary',   desc:'Prestasi masuk' },
            { label:'Tervalidasi',     value:stats.verified, icon:CheckCircle2, bg:'bg-emerald-50', color:'text-emerald-600', desc:'Sudah diverifikasi' },
            { label:'Menunggu Review', value:stats.pending,  icon:Clock,        bg:'bg-amber-50',   color:'text-amber-600',   desc:'Perlu tindak lanjut' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-slate-100/50 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', s.bg, s.color)}>
                  <s.icon size={18} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 leading-none tabular-nums">
                {loading ? <span className="material-symbols-outlined animate-spin text-slate-300" style={{ fontSize: '18px' }} >sync</span> : s.value}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-1">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-100/50 rounded-3xl shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1">
              <h2 className="font-bold text-base text-slate-900">Daftar Pengajuan Prestasi</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Menampilkan <span className="font-bold text-slate-900">{filtered.length}</span> dari <span className="font-bold text-primary">{achievements.length}</span> pengajuan
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 gap-y-3 w-full sm:w-auto">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '14px' }} >search</span>
                <input type="text" placeholder="Cari nama atau prestasi..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="pl-9 pr-4 h-9 w-52 rounded-xl border border-slate-200/60 focus:outline-none focus:border-primary text-sm bg-white" />
              </div>
              <div className="relative">
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  className="h-9 pl-3 pr-8 rounded-xl border border-slate-200/60 text-xs font-medium bg-white text-slate-600 focus:outline-none focus:border-primary appearance-none cursor-pointer">
                  <option value="all">Semua Status</option>
                  <option value="verified">Terverifikasi</option>
                  <option value="pending">Menunggu</option>
                  <option value="rejected">Ditolak</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none select-none" style={{ fontSize: '16px' }}>keyboard_arrow_down</span>
              </div>
              <div className="relative">
                <select value={filterSemester} onChange={e => setFilterSemester(e.target.value)}
                  className="h-9 pl-3 pr-8 rounded-xl border border-slate-200/60 text-xs font-medium bg-white text-slate-600 focus:outline-none focus:border-primary appearance-none cursor-pointer">
                  <option value="all">Semua Semester</option>
                  {semesterOptions.map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none select-none" style={{ fontSize: '16px' }}>keyboard_arrow_down</span>
              </div>
              <div className="relative">
                <select value={filterPeriode} onChange={e => setFilterPeriode(e.target.value)}
                  className="h-9 pl-3 pr-8 rounded-xl border border-slate-200/60 text-xs font-medium bg-white text-slate-600 focus:outline-none focus:border-primary appearance-none cursor-pointer">
                  <option value="all">Semua Periode</option>
                  {periodeOptions.map(per => (
                    <option key={per} value={per}>Periode {per}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none select-none" style={{ fontSize: '16px' }}>keyboard_arrow_down</span>
              </div>
              <div className="relative">
                <select value={filterProdi} onChange={e => setFilterProdi(e.target.value)}
                  className="h-9 pl-3 pr-8 rounded-xl border border-slate-200/60 text-xs font-medium bg-white text-slate-600 focus:outline-none focus:border-primary appearance-none cursor-pointer">
                  <option value="all">Semua Prodi</option>
                  {prodiOptions.map(prod => (
                    <option key={prod} value={prod}>{prod}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none select-none" style={{ fontSize: '16px' }}>keyboard_arrow_down</span>
              </div>
              {(search || filterStatus !== 'all' || filterSemester !== 'all' || filterPeriode !== 'all' || filterProdi !== 'all') && (
                <button onClick={() => { setSearch(''); setFilterStatus('all'); setFilterSemester('all'); setFilterPeriode('all'); setFilterProdi('all'); }}
                  className="h-9 px-3 text-xs font-semibold text-rose-600 bg-rose-50 rounded-xl border border-rose-200 hover:bg-rose-100">Reset</button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200/60">
                  {[
                    { label: 'No', key: null, sortable: false },
                    { label: 'Mahasiswa', key: 'mahasiswa', sortable: true },
                    { label: 'Prestasi / Penghargaan', key: 'NamaKegiatan', sortable: true },
                    { label: 'Tingkat', key: 'Tingkat', sortable: true },
                    { label: 'Status', key: 'Status', sortable: true },
                    { label: 'Tahun', key: 'CreatedAt', sortable: true },
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
                {loading ? Array.from({length: pageSize}).map((_,i) => (
                  <tr key={i} className="border-b border-slate-100">
                    {[...Array(7)].map((__,j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-slate-50 rounded animate-pulse"/></td>)}
                  </tr>
                )) : paginated.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-[#eef4ff] rounded-2xl flex items-center justify-center text-primary"><Trophy size={22}/></div>
                      <p className="font-bold text-sm text-slate-900">Tidak Ada Pengajuan</p>
                      <p className="text-xs text-slate-400">Belum ada mahasiswa yang mengajukan prestasi.</p>
                    </div>
                  </td></tr>
                ) : paginated.map((row, i) => {
                  const st = getStatus(row.Status)
                  const tingkatCls = TINGKAT_STYLES[(row.Tingkat||'').toLowerCase()] || 'bg-slate-50 text-slate-600 border-slate-200'
                  return (
                    <tr key={row.ID||i} className="border-b border-[#f5f5f5] hover:bg-[#fafbff] transition-colors">
                      <td className="px-5 py-3.5 text-sm text-slate-400 font-medium">{(currentPage - 1) * pageSize + i + 1}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <StudentAvatar src={getFullUrl(row.Mahasiswa?.FotoURL || row.Mahasiswa?.foto_url || row.Mahasiswa?.Foto || row.Mahasiswa?.Pengguna?.Foto)} name={row.Mahasiswa?.Nama} className="w-9 h-9 rounded-xl" />
                          <div>
                            <p className="font-bold text-sm text-slate-900 leading-snug">{row.Mahasiswa?.Nama||'—'}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{row.Mahasiswa?.NIM||'—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-sm text-slate-900 leading-snug max-w-[200px] truncate">{row.NamaKegiatan||'—'}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="inline-block text-[10px] font-bold text-[#00236F] bg-[#eef4ff] px-2 py-0.5 rounded-md">{row.Kategori||'Umum'}</span>
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${row.Tipe === 'Pengajuan Dana' ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200'}`}>{row.Tipe || 'Laporan Prestasi'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider', tingkatCls)}>
                          {row.Tingkat||'Lokal'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider', st.cls)}>
                          <span className={cn('w-1.5 h-1.5 rounded-full', st.dot)}/>{st.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500 font-medium whitespace-nowrap">
                        {row.CreatedAt ? new Date(row.CreatedAt).getFullYear() : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setSelected(row)}
                            className="p-1.5 text-slate-400 hover:text-primary hover:bg-[#eef4ff] rounded-lg transition-colors" title="Detail">
                            <span className="material-symbols-outlined" style={{ fontSize: '15px' }} >visibility</span>
                          </button>
                          {(row.Status || '').toLowerCase() === 'menunggu' && (
                            <>
                              <button onClick={() => handleOpenVerify(row, 'verified')} disabled={isSubmitting}
                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Setujui">
                                <span className="material-symbols-outlined" style={{ fontSize: '15px' }} >check_circle</span>
                              </button>
                              <button onClick={() => handleOpenVerify(row, 'rejected')} disabled={isSubmitting}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Tolak">
                                <span className="material-symbols-outlined" style={{ fontSize: '15px' }} >close</span>
                              </button>
                            </>
                          )}
                        </div>
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

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setSelected(null)}>
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl z-[101] flex flex-col overflow-hidden max-h-[90vh]"
            onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="relative bg-gradient-to-br from-[#00236F] via-[#00308F] to-[#003db5] pt-6 pb-7 px-6 overflow-hidden flex-shrink-0">
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full pointer-events-none"/>
              <button onClick={() => setSelected(null)}
                className="absolute z-50 top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }} >close</span>
              </button>
              <div className="relative z-10 flex items-center gap-4 mb-5">
                <StudentAvatar src={getFullUrl(selected.Mahasiswa?.FotoURL || selected.Mahasiswa?.foto_url || selected.Mahasiswa?.Foto || selected.Mahasiswa?.Pengguna?.Foto)} name={selected.Mahasiswa?.Nama} className="w-14 h-14 rounded-2xl shadow-xl ring-2 ring-white/20" />
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.25em] mb-1">
                    {selected.Tipe === 'Pengajuan Dana' ? 'Pengajuan Dana Lomba' : 'Pengajuan Prestasi'}
                  </p>
                  <h2 className="text-base font-extrabold text-white leading-tight line-clamp-2">{selected.NamaKegiatan}</h2>
                  <p className="text-xs text-blue-200 font-medium mt-0.5">{selected.Mahasiswa?.Nama} · {selected.Mahasiswa?.NIM}</p>
                </div>
              </div>
              <div className="relative z-10 flex flex-wrap gap-2">
                {selected.Kategori && <span className="flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl text-[10px] font-bold text-white uppercase tracking-wider"><Award size={10}/>{selected.Kategori}</span>}
                {selected.Tingkat  && <span className="flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl text-[10px] font-bold text-white uppercase tracking-wider"><Star size={10}/>{selected.Tingkat}</span>}
                <span className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider',
                  ['verified','terverifikasi','disetujui','diverifikasi'].includes((selected.Status||'').toLowerCase())
                    ? 'bg-emerald-400/20 border border-emerald-300/30 text-emerald-200'
                    : (selected.Status||'').toLowerCase().includes('tolak') || (selected.Status||'').toLowerCase()==='rejected'
                    ? 'bg-rose-400/20 border border-rose-300/30 text-rose-200'
                    : 'bg-amber-400/20 border border-amber-300/30 text-amber-200'
                )}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"/>
                  {getStatus(selected.Status).label}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Ditolak alert */}
              {(selected.Status||'').toLowerCase().includes('tolak') || (selected.Status||'').toLowerCase()==='rejected' ? (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
                  <span className="material-symbols-outlined text-rose-600 flex-shrink-0 mt-0.5" style={{ fontSize: '16px' }} >close</span>
                  <div>
                    <p className="font-bold text-rose-700 text-sm">Pengajuan Ditolak</p>
                    <p className="text-rose-600 text-xs mt-0.5">{selected.CatatanVerifikator || 'Berkas tidak sesuai kriteria.'}</p>
                  </div>
                </div>
              ) : null}

              {/* Info Grid */}
              <div className="space-y-1">
                {[
                  { icon:GraduationCap, label:'Program Studi', value: selected.Mahasiswa?.ProgramStudi?.Nama },
                  { icon:Award,        label:'Kategori',       value: selected.Kategori },
                  { icon:Star,         label:'Tingkat',        value: selected.Tingkat },
                  selected.Tipe === 'Pengajuan Dana' ? null : { icon:Trophy,       label:'Peringkat',      value: selected.Peringkat },
                  { icon:Calendar,     label:'Tanggal',        value: formatDate(selected.CreatedAt) },
                  selected.Tipe === 'Pengajuan Dana' ? { icon:CheckCircle2, label:'Dana Diajukan',   value: `Rp ${(selected.DanaDiajukan || 0).toLocaleString('id-ID')}` } : { icon:CheckCircle2, label:'Poin Didapat',   value: selected.Poin != null ? `${selected.Poin} Poin` : '—' },
                  selected.Tipe === 'Pengajuan Dana' && selected.DanaDisetujui > 0 ? { icon:CheckCircle2, label:'Dana Disetujui', value: `Rp ${selected.DanaDisetujui.toLocaleString('id-ID')}` } : null,
                ].filter(Boolean).map(r => (
                  <div key={r.label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 border border-slate-100 hover:bg-white transition-all">
                    <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm border border-slate-100 flex-shrink-0">
                      <r.icon size={13}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">{r.label}</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">{r.value||'—'}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bukti */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-2">
                  {selected.Tipe === 'Pengajuan Dana' ? 'Proposal / Dokumen Pendukung' : 'Bukti / Sertifikat'}
                </p>
                {selected.BuktiURL ? (
                  <a href={`${API_BASE_URL.replace('/api','')}${selected.BuktiURL}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/60 hover:bg-[#eef4ff] hover:border-primary transition-all">
                    <div className="w-9 h-9 bg-[#eef4ff] rounded-xl flex items-center justify-center text-primary flex-shrink-0"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >description</span></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-primary text-sm">
                        {selected.Tipe === 'Pengajuan Dana' ? 'Lihat Proposal / Dokumen' : 'Lihat Dokumen Sertifikat'}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{selected.BuktiURL}</p>
                    </div>
                    <ExternalLink size={14} className="text-primary/40 flex-shrink-0"/>
                  </a>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-[#c4c4c4] flex-shrink-0"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >description</span></div>
                    <p className="text-sm text-[#c4c4c4] font-medium italic">Belum ada lampiran diunggah.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex gap-3 flex-shrink-0">
              <button onClick={() => setSelected(null)}
                className="w-full h-11 rounded-xl border border-slate-200/60 bg-white text-xs font-bold text-slate-600 uppercase tracking-widest hover:bg-slate-50 transition-all">
                Tutup
              </button>
              {(selected.Status || '').toLowerCase() === 'menunggu' && (
                <>
                  <button onClick={() => handleOpenVerify(selected, 'rejected')} disabled={isSubmitting}
                    className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-rose-600/20 disabled:opacity-60 flex items-center justify-center gap-2">
                    Tolak
                  </button>
                  <button onClick={() => handleOpenVerify(selected, 'verified')} disabled={isSubmitting}
                    className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-emerald-600/20 disabled:opacity-60 flex items-center justify-center gap-2">
                    Validasi
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Verification Action Dialog */}
      {isVerifyOpen && selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 flex flex-col font-body">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {verifyStatus === "verified" ? "Setujui Pengajuan" : "Tolak Pengajuan"}
              </h2>
              <button onClick={() => setIsVerifyOpen(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-4 mt-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Catatan Verifikator</label>
                <textarea
                  placeholder="Masukkan catatan..."
                  value={verifyCatatan}
                  onChange={(e) => setVerifyCatatan(e.target.value)}
                  className="rounded-xl border border-slate-200 focus:border-primary shadow-none text-sm p-3 w-full bg-slate-50/50 focus:bg-white min-h-[90px] outline-none"
                  required
                />
              </div>

              {(selected.Tipe || selected.tipe) === "Pengajuan Dana" ? (
                verifyStatus === "verified" && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Dana yang Disetujui (Rp)</label>
                    <input
                      type="number"
                      value={verifyDanaDisetujui}
                      onChange={(e) => setVerifyDanaDisetujui(e.target.value)}
                      className="rounded-xl border border-slate-200 focus:border-primary text-sm px-4 py-2 w-full outline-none"
                      placeholder="Cth: 1200000"
                      required
                    />
                  </div>
                )
              ) : (
                verifyStatus === "verified" && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Poin SKPI Didapat</label>
                    <input
                      type="number"
                      value={verifyPoin}
                      onChange={(e) => setVerifyPoin(e.target.value)}
                      className="rounded-xl border border-slate-200 focus:border-primary text-sm px-4 py-2 w-full outline-none"
                      required
                    />
                  </div>
                )
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsVerifyOpen(false)}
                  className="flex-1 h-10 rounded-xl border border-slate-200 text-xs font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn("flex-1 h-10 rounded-xl text-xs font-bold uppercase tracking-widest text-white border-none",
                    verifyStatus === "verified" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-[#dc2626] hover:bg-[#b91c1c]"
                  )}
                >
                  {isSubmitting ? "Menyimpan..." : (verifyStatus === "verified" ? "Validasi" : "Tolak")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

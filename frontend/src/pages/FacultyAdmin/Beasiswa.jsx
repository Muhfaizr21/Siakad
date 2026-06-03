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
const RefreshCw = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>sync</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const GraduationCap = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>school</span>;
const Users = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>group</span>;
const Clock = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>schedule</span>;
const UserCheck = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>how_to_reg</span>;



const API = `${API_BASE_URL}/faculty`

const AVATAR_COLORS = [
  'from-blue-400 to-indigo-500', 'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500', 'from-rose-400 to-pink-500',
  'from-violet-400 to-purple-500', 'from-cyan-400 to-sky-500',
]
const getInitials = (n = '') => n.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || '?'

const APP_STATUS = {
  diterima: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Diterima (Final)' },
  ditolak: { cls: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500', label: 'Ditolak (Final)' },
  proses: { cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', label: 'Proses' },
  'disetujui fakultas': { cls: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500', label: 'Disetujui Fakultas' },
  'ditolak fakultas': { cls: 'bg-rose-50 text-rose-700 border-rose-100', dot: 'bg-rose-400', label: 'Ditolak Fakultas' },
}
const getAppStatus = (v = '') => {
  const norm = (v || 'proses').toLowerCase();
  return APP_STATUS[norm] || APP_STATUS.proses;
}

const formatDate = (d) => { try { return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) } catch { return d } }
const formatDateTime = (d) => { try { return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB' } catch { return d } }

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

const renderAttachment = (url, label) => {
  if (!url) return null;
  const fullUrl = getFullUrl(url);
  if (!fullUrl) return null;
  
  const isImage = fullUrl.match(/\.(jpeg|jpg|gif|png)$/i) != null;
  return (
    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col gap-2 shadow-sm mb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-rose-500" style={{ fontSize: 20 }}>
             {isImage ? 'image' : 'description'}
          </span>
          <div className="text-left">
            <p className="text-xs font-bold text-slate-700 truncate max-w-[200px]">
              {label}
            </p>
            <p className="text-[9px] text-slate-400">Klik untuk melihat file</p>
          </div>
        </div>
        <a href={fullUrl} target="_blank" rel="noreferrer" className="text-primary hover:bg-blue-50 p-1.5 rounded-lg transition-colors">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>open_in_new</span>
        </a>
      </div>
      {isImage && (
        <a href={fullUrl} target="_blank" rel="noreferrer" className="mt-1 block rounded-xl overflow-hidden border border-slate-200 hover:opacity-90 transition-opacity">
          <img src={fullUrl} alt={label} className="w-full h-auto object-cover max-h-48" />
        </a>
      )}
    </div>
  );
};

export default function FacultyScholarship() {
  const [activeTab, setActiveTab] = useState('programs')
  const [scholarships, setScholarships] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProgram, setSelectedProgram] = useState(null)
  const [previewApp, setPreviewApp] = useState(null)
  const [search, setSearch] = useState('')
  const [selectedScholarshipFilter, setSelectedScholarshipFilter] = useState('Semua')

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortConfig, setSortConfig] = useState({ key: 'Nama', direction: 'asc' })

  const uniqueScholarships = useMemo(() => {
    const map = new Map()
    scholarships.forEach(s => {
      if (s.Nama) {
        map.set(s.Nama, s.Nama)
      }
    })
    return Array.from(map.values())
  }, [scholarships])

  useEffect(() => {
    setCurrentPage(1)
    setSortConfig(activeTab === 'programs' ? { key: 'Nama', direction: 'asc' } : { key: 'Mahasiswa.Nama', direction: 'asc' })
  }, [activeTab])

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
      .badge-green  { background:#dcfce7; color:#15803d; border:1px solid #bbf7d0; }
      .badge-amber  { background:#fef9c3; color:#a16207; border:1px solid #fef08a; }
      .badge-red    { background:#fee2e2; color:#b91c1c; border:1px solid #fecaca; }
      .badge-slate  { background:#f1f5f9; color:#475569; border:1px solid #e2e8f0; }
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
        <p>Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB</p>
        <br/><p>Mengetahui,</p>
        <p style="font-weight:700;margin-top:4px;">Koordinator Kemahasiswaan Fakultas</p>
        <div class="sig-line"></div>
      </div>
      <script>window.onload=function(){setTimeout(function(){window.print();setTimeout(function(){window.close();},100);},300);};<\/script>
    </body></html>`;
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const exportBeasiswaPDF = () => {
    const now = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    if (activeTab === 'programs') {
      if (scholarships.length === 0) { toast.error('Tidak ada data beasiswa untuk diekspor'); return; }
      const data = filteredPrograms.length > 0 && filteredPrograms.length < scholarships.length ? filteredPrograms : scholarships;
      let rows = '';
      data.forEach((s, i) => {
        const isAktif = new Date(s.Deadline) > new Date();
        rows += `<tr>
          <td>${i + 1}</td>
          <td style="font-weight:700;">${s.Nama || '—'}<br/><span style="font-size:7px;color:#64748b;">Min. IPK ${s.MinIPK || '3.00'}</span></td>
          <td>${s.Penyelenggara || '—'}</td>
          <td style="text-align:center;font-weight:700;">${s.acceptedCount || 0} / ${s.Kuota || 0}</td>
          <td style="color:#b91c1c;">${s.Deadline ? new Date(s.Deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
          <td><span class="badge ${isAktif ? 'badge-green' : 'badge-slate'}">${isAktif ? 'Aktif' : 'Selesai'}</span></td>
        </tr>`;
      });
      const aktif = data.filter(s => new Date(s.Deadline) > new Date()).length;
      const content = `<table style="width:100%;border-collapse:collapse;border:none;margin-bottom:16px;"><tr>
        <td style="padding:0 6px 0 0;width:50%;"><div style="background:#f8fafc;border:1px solid #e2e8f0;padding:10px 12px;border-radius:5px;">
          <div style="font-size:7px;font-weight:700;color:#64748b;text-transform:uppercase;">Total Program</div>
          <div style="font-size:14px;font-weight:700;color:#00236F;">${data.length} Program</div>
        </div></td>
        <td style="padding:0 0 0 6px;width:50%;"><div style="background:#f8fafc;border:1px solid #e2e8f0;padding:10px 12px;border-radius:5px;">
          <div style="font-size:7px;font-weight:700;color:#64748b;text-transform:uppercase;">Program Aktif</div>
          <div style="font-size:14px;font-weight:700;color:#15803d;">${aktif} Program</div>
        </div></td>
      </tr></table>
      <table class="data-table"><thead><tr>
        <th style="width:5%;">No</th><th style="width:30%;">Nama Beasiswa</th><th style="width:20%;">Penyelenggara</th>
        <th style="width:12%;text-align:center;">Penerima/Kuota</th><th style="width:15%;">Deadline</th><th style="width:10%;">Status</th>
      </tr></thead><tbody>${rows}</tbody></table>`;
      downloadPDF('Daftar Program Beasiswa Mahasiswa', `Rekap Program Bantuan Finansial — ${now}`, content);
      toast.success(`Berhasil mencetak ${data.length} program beasiswa!`);
    } else {
      if (applications.length === 0) { toast.error('Tidak ada data pendaftar untuk diekspor'); return; }
      const data = filteredApps.length > 0 && filteredApps.length < applications.length ? filteredApps : applications;
      const badge = (s) => `<span class="badge ${s === 'diterima' ? 'badge-green' : s === 'ditolak' ? 'badge-red' : 'badge-amber'}">${s === 'diterima' ? 'Diterima' : s === 'ditolak' ? 'Ditolak' : 'Proses'}</span>`;
      let rows = '';
      data.forEach((a, i) => {
        rows += `<tr>
          <td>${i + 1}</td>
          <td style="font-weight:700;">${a.Mahasiswa?.Nama || '—'}<br/><span style="font-size:7px;color:#64748b;">NIM: ${a.Mahasiswa?.NIM || '—'}</span></td>
          <td>${a.Beasiswa?.Nama || '—'}</td>
          <td>${badge(a.Status || 'proses')}</td>
        </tr>`;
      });
      const lolos = data.filter(a => a.Status === 'diterima').length;
      const content = `<table style="width:100%;border-collapse:collapse;border:none;margin-bottom:16px;"><tr>
        <td style="padding:0 6px 0 0;width:50%;"><div style="background:#f8fafc;border:1px solid #e2e8f0;padding:10px 12px;border-radius:5px;">
          <div style="font-size:7px;font-weight:700;color:#64748b;text-transform:uppercase;">Total Pendaftar</div>
          <div style="font-size:14px;font-weight:700;color:#00236F;">${data.length} Orang</div>
        </div></td>
        <td style="padding:0 0 0 6px;width:50%;"><div style="background:#f8fafc;border:1px solid #e2e8f0;padding:10px 12px;border-radius:5px;">
          <div style="font-size:7px;font-weight:700;color:#64748b;text-transform:uppercase;">Lolos Seleksi</div>
          <div style="font-size:14px;font-weight:700;color:#15803d;">${lolos} Orang</div>
        </div></td>
      </tr></table>
      <table class="data-table"><thead><tr>
        <th style="width:5%;">No</th><th style="width:40%;">Pendaftar</th><th style="width:35%;">Program Beasiswa</th><th style="width:15%;">Status</th>
      </tr></thead><tbody>${rows}</tbody></table>`;
      downloadPDF('Rekap Pendaftar Seleksi Beasiswa', `Daftar Hasil Seleksi Penerimaan Beasiswa Mahasiswa — ${now}`, content);
      toast.success(`Berhasil mencetak ${data.length} data pendaftar!`);
    }
  };

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj)
  }

  const normalizeProgram = (s) => ({
    ...s,
    ID: s.id || s.ID,
    Nama: s.nama || s.Nama || '—',
    Penyelenggara: s.penyelenggara || s.Penyelenggara || '—',
    Kuota: s.kuota ?? s.Kuota ?? 0,
    Deadline: s.deadline || s.Deadline,
    MinIPK: s.ipk_min ?? s.MinIPK ?? s.IPKMin ?? '3.00',
    acceptedCount: s.accepted_count ?? s.acceptedCount ?? 0,
    Kategori: s.kategori || s.Kategori || '',
    CreatedAt: s.created_at || s.CreatedAt || s.Created || '',
  })

  const normalizeApp = (a, i) => {
    const m = a.Mahasiswa || a.mahasiswa || {};
    const b = a.Beasiswa || a.beasiswa || {};
    return {
      ...a,
      ID: a.id || a.ID,
      Status: a.status || a.Status || 'proses',
      Catatan: a.catatan || a.Catatan || '',
      Motivasi: a.motivasi || a.Motivasi || '',
      FileURL: a.bukti_url || a.BuktiURL || a.file_url || a.FileURL || null,
      KtmKtpURL: a.ktm_ktp_url || a.KtmKtpURL || null,
      SertifikatURL: a.sertifikat_url || a.SertifikatURL || null,
      TranskripURL: a.transkrip_url || a.TranskripURL || null,
      Mahasiswa: {
        Nama: m.nama || m.Nama || '—',
        NIM: m.nim || m.NIM || '—',
        Foto: getFullUrl(m.foto_url || m.FotoURL || m.foto || m.Foto || null),
      },
      Beasiswa: {
        Nama: b.nama || b.Nama || '—',
        Kategori: b.kategori || b.Kategori || '',
      },
      colorIdx: i % AVATAR_COLORS.length,
    };
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [schRes, appRes] = await Promise.all([
        api.get('/faculty/scholarships'),
        api.get('/faculty/scholarships/applications')
      ])
      setScholarships((schRes.data.data || []).map(normalizeProgram))
      setApplications((appRes.data.data || []).map(normalizeApp))
    } catch { toast.error('Gagal mengambil data') }
    finally { setLoading(false) }
  }


  useEffect(() => { fetchData() }, [activeTab])

  const filteredPrograms = useMemo(() => scholarships.filter(s => {
    const q = search.toLowerCase()
    return !q || s.Nama?.toLowerCase().includes(q) || s.Penyelenggara?.toLowerCase().includes(q)
  }), [scholarships, search])

  const filteredApps = useMemo(() => applications.filter(a => {
    const q = search.toLowerCase()
    const matchesSearch = !q || a.Mahasiswa?.Nama?.toLowerCase().includes(q) || a.Mahasiswa?.NIM?.includes(q)
    const matchesScholarship = selectedScholarshipFilter === 'Semua' || a.Beasiswa?.Nama === selectedScholarshipFilter
    return matchesSearch && matchesScholarship
  }), [applications, search, selectedScholarshipFilter])

  const sortedPrograms = useMemo(() => {
    let items = [...filteredPrograms]
    if (sortConfig.key !== null && activeTab === 'programs') {
      items.sort((a, b) => {
        let aVal = getNestedValue(a, sortConfig.key)
        let bVal = getNestedValue(b, sortConfig.key)

        if (typeof aVal === 'string') aVal = aVal.toLowerCase()
        if (typeof bVal === 'string') bVal = bVal.toLowerCase()

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }
    return items
  }, [filteredPrograms, sortConfig, activeTab])

  const sortedApps = useMemo(() => {
    let items = [...filteredApps]
    if (sortConfig.key !== null && activeTab === 'applications') {
      items.sort((a, b) => {
        let aVal = getNestedValue(a, sortConfig.key)
        let bVal = getNestedValue(b, sortConfig.key)

        if (typeof aVal === 'string') aVal = aVal.toLowerCase()
        if (typeof bVal === 'string') bVal = bVal.toLowerCase()

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }
    return items
  }, [filteredApps, sortConfig, activeTab])

  const paginatedPrograms = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedPrograms.slice(start, start + pageSize)
  }, [sortedPrograms, currentPage, pageSize])

  const paginatedApps = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedApps.slice(start, start + pageSize)
  }, [sortedApps, currentPage, pageSize])

  const totalItems = activeTab === 'programs' ? filteredPrograms.length : filteredApps.length
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
    totalPrograms: scholarships.length,
    aktif: scholarships.filter(s => new Date(s.Deadline) > new Date()).length,
    pendaftar: applications.filter(a => (a.Status || 'proses').toLowerCase() === 'proses').length,
    lolos: applications.filter(a => (a.Status || '').toLowerCase() === 'diterima').length,
  }

  const TABS = [
    { key: 'programs', label: 'Program Beasiswa', icon: GraduationCap },
    { key: 'applications', label: 'Review Pendaftar', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-transparent font-inter">
      <Toaster position="top-right" />
      <div className="max-w-[1600px] mx-auto px-4 py-8 md:px-8 xl:px-12 space-y-6">

        {/* Header */}
        <section className="relative overflow-hidden rounded-2xl h-auto md:h-48 flex flex-col md:flex-row items-center group shadow-none p-6 md:p-8 border border-slate-200/60 glass-card">
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
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Program Bantuan Akademik</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 font-headline tracking-tight leading-tight">
                Manajemen <span className="text-primary">Beasiswa</span>
              </h1>
              <p className="text-slate-500 font-medium text-sm max-w-xl leading-relaxed mt-1">
                Kelola program beasiswa dan verifikasi pendaftaran mahasiswa di lingkungan fakultas.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={exportBeasiswaPDF} disabled={loading || (activeTab === 'programs' ? scholarships.length === 0 : applications.length === 0)}
                className="h-11 px-5 rounded-xl border border-slate-200/60 bg-white text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50/50 gap-2 flex items-center transition-all active:scale-95 shadow-sm disabled:opacity-50">
                <Download size={14} className="text-primary" /> Ekspor PDF
              </button>
              <button onClick={fetchData} disabled={loading}
                className="h-11 px-5 rounded-xl border border-slate-200/60 bg-white text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50/50 gap-2 flex items-center transition-all active:scale-95 shadow-sm disabled:opacity-60">
                {loading ? <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '14px' }} >sync</span> : <RefreshCw size={14} className="text-primary" />}
                Refresh
              </button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Beasiswa', value: stats.totalPrograms, icon: GraduationCap, bg: 'bg-[#eef4ff]', color: 'text-primary', desc: 'Program terdaftar' },
            { label: 'Program Aktif', value: stats.aktif, icon: Clock, bg: 'bg-emerald-50', color: 'text-emerald-600', desc: 'Deadline belum lewat' },
            { label: 'Pendaftar Baru', value: stats.pendaftar, icon: Users, bg: 'bg-amber-50', color: 'text-amber-600', desc: 'Sedang diproses' },
            { label: 'Lolos Seleksi', value: stats.lolos, icon: UserCheck, bg: 'bg-indigo-50', color: 'text-indigo-600', desc: 'Diterima beasiswa' },
          ].map(s => (
            <div key={s.label} className="glass-card border border-slate-200/60 rounded-2xl p-5 shadow-none">
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

        {/* Tabs */}
        <div className="flex items-center gap-1 glass-card border border-slate-200/60 rounded-2xl p-1.5 w-fit shadow-none">
          {TABS.map(t => (
            <button key={t.key} onClick={() => { 
              setActiveTab(t.key); 
              setSearch('');
              setSelectedScholarshipFilter('Semua');
            }}
              className={cn('flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all',
                activeTab === t.key ? 'bg-primary text-white shadow-lg shadow-bku-primary/25' : 'text-slate-500 hover:bg-slate-50')}>
              <t.icon size={14} />{t.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="glass-card border border-slate-200/60 rounded-2xl shadow-none overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1">
              <h2 className="font-black text-slate-800 text-sm uppercase tracking-tight font-headline">
                {activeTab === 'programs' ? 'Daftar Program Beasiswa' : 'Daftar Pendaftar Beasiswa'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Menampilkan <span className="font-bold text-slate-900">
                  {activeTab === 'programs' ? filteredPrograms.length : filteredApps.length}
                </span> dari <span className="font-bold text-primary">
                  {activeTab === 'programs' ? scholarships.length : applications.length}
                </span> data
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {activeTab === 'applications' && uniqueScholarships.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Filter Beasiswa:</span>
                  <Select value={selectedScholarshipFilter} onValueChange={setSelectedScholarshipFilter}>
                    <SelectTrigger className="h-9 w-48 rounded-xl border-slate-200 bg-white/50 font-semibold text-xs shadow-sm focus:ring-primary/20 px-3 py-1 flex items-center justify-between">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-200 shadow-xl p-1 font-inter glass-card">
                      <SelectItem value="Semua" className="rounded-xl text-xs py-1.5 focus:bg-primary/5 focus:text-primary">
                        Semua Beasiswa
                      </SelectItem>
                      {uniqueScholarships.map((name) => (
                        <SelectItem key={name} value={name} className="rounded-xl text-xs py-1.5 focus:bg-primary/5 focus:text-primary">
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '14px' }} >search</span>
                <input type="text" placeholder={activeTab === 'programs' ? 'Cari nama beasiswa...' : 'Cari mahasiswa atau NIM...'}
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="pl-9 pr-4 h-9 w-52 rounded-xl border border-slate-200/60 focus:outline-none focus:border-primary text-sm bg-transparent" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {activeTab === 'programs' ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200/60">
                    {[
                      { label: 'No', key: null, sortable: false },
                      { label: 'Program Beasiswa', key: 'Nama', sortable: true },
                      { label: 'Penyelenggara', key: 'Penyelenggara', sortable: true },
                      { label: 'Kapasitas', key: 'Kuota', sortable: true },
                      { label: 'Deadline', key: 'Deadline', sortable: true },
                      { label: 'Status', key: null, sortable: false },
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
                    <tr key={i} className="border-b border-slate-100">
                      {[...Array(7)].map((__, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-slate-50 rounded animate-pulse" /></td>)}
                    </tr>
                  )) : paginatedPrograms.length === 0 ? (
                    <tr><td colSpan={7} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-[#eef4ff] rounded-2xl flex items-center justify-center text-primary"><span className="material-symbols-outlined" style={{ fontSize: '22px' }} >school</span></div>
                        <p className="font-bold text-sm text-slate-900">Tidak Ada Program Beasiswa</p>
                        <p className="text-xs text-slate-400">Belum ada program beasiswa yang terdaftar.</p>
                      </div>
                    </td></tr>
                  ) : paginatedPrograms.map((row, i) => {
                    const isAktif = new Date(row.Deadline) > new Date()
                    return (
                      <tr key={row.ID || i} className="border-b border-[#f5f5f5] hover:bg-[#fafbff] transition-colors">
                        <td className="px-5 py-3.5 text-sm text-slate-400 font-medium">{(currentPage - 1) * pageSize + i + 1}</td>
                        <td className="px-5 py-3.5">
                          <p className="font-bold text-sm text-slate-900">{row.Nama}</p>
                          <div className="flex flex-col gap-0.5 mt-1">
                            <span className="text-[10px] text-slate-400 font-medium">Min. IPK {row.MinIPK || '3.00'}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              Dibuat: {row.CreatedAt || row.created_at ? formatDateTime(row.CreatedAt || row.created_at) : '—'}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-sm text-slate-600 font-medium">{row.Penyelenggara || '—'}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          {(() => {
                            const current = row.acceptedCount || 0;
                            const capacity = row.Kuota || 1;
                            const pct = current >= capacity
                              ? 100
                              : Math.min(99, Math.floor((current / capacity) * 100));
                            return (
                              <div className="flex items-center gap-4 min-w-[140px] max-w-[180px]">
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] text-slate-400 font-bold font-inter">
                                      {current} / {row.Kuota || 0} Mhs
                                    </span>
                                    <span className="text-[10px] font-black text-primary font-inter">
                                      {pct}%
                                    </span>
                                  </div>
                                  <div className="w-full h-1.5 bg-slate-100/80 rounded-full overflow-hidden">
                                    <div
                                      className={cn(
                                        "h-full rounded-full transition-all duration-500",
                                        pct > 90
                                          ? "bg-rose-500"
                                          : "bg-gradient-to-r from-primary to-blue-400"
                                      )}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200">
                            {formatDate(row.Deadline)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider',
                            isAktif ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200')}>
                            <span className={cn('w-1.5 h-1.5 rounded-full', isAktif ? 'bg-emerald-500' : 'bg-slate-400')} />
                            {isAktif ? 'Aktif' : 'Selesai'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <button onClick={() => setSelectedProgram(row)}
                            className="p-1.5 text-slate-400 hover:text-primary hover:bg-[#eef4ff] rounded-lg transition-colors" title="Lihat Pendaftar">
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>visibility</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200/60">
                    {[
                      { label: 'No', key: null, sortable: false },
                      { label: 'Pendaftar', key: 'Mahasiswa.Nama', sortable: true },
                      { label: 'Program Beasiswa', key: 'Beasiswa.Nama', sortable: true },
                      { label: 'Berkas', key: null, sortable: false },
                      { label: 'Status', key: 'Status', sortable: true },
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
                    <tr key={i} className="border-b border-slate-100">
                      {[...Array(6)].map((__, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-slate-50 rounded animate-pulse" /></td>)}
                    </tr>
                  )) : paginatedApps.length === 0 ? (
                    <tr><td colSpan={6} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-[#eef4ff] rounded-2xl flex items-center justify-center text-primary"><span className="material-symbols-outlined" style={{ fontSize: '22px' }} >group</span></div>
                        <p className="font-bold text-sm text-slate-900">Belum Ada Pendaftar</p>
                        <p className="text-xs text-slate-400">Tidak ada mahasiswa yang mendaftar beasiswa.</p>
                      </div>
                    </td></tr>
                  ) : paginatedApps.map((row, i) => {
                    const st = getAppStatus(row.Status)
                    return (
                      <tr key={row.ID || i} className="border-b border-[#f5f5f5] hover:bg-[#fafbff] transition-colors">
                        <td className="px-5 py-3.5 text-sm text-slate-400 font-medium">{(currentPage - 1) * pageSize + i + 1}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <StudentAvatar src={row.Mahasiswa?.Foto} name={row.Mahasiswa?.Nama} className="w-9 h-9 rounded-xl" />
                            <div>
                              <p className="font-bold text-sm text-slate-900">{row.Mahasiswa?.Nama || '—'}</p>
                              <div className="flex flex-col gap-0.5 mt-0.5">
                                <span className="text-[10px] text-slate-400 font-medium">{row.Mahasiswa?.NIM || '—'}</span>
                                <span className="text-[10px] text-slate-400 font-semibold">
                                  Mendaftar: {row.CreatedAt || row.created_at ? formatDateTime(row.CreatedAt || row.created_at) : '—'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-sm text-slate-600 font-medium">{row.Beasiswa?.Nama || '—'}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          {(row.FileURL || row.KtmKtpURL || row.TranskripURL || row.SertifikatURL) ? (
                            <button onClick={() => setPreviewApp(row)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
                              <span className="material-symbols-outlined" style={{ fontSize: '13px' }} >attachment</span> Lihat Berkas
                            </button>
                          ) : <span className="text-xs text-[#c4c4c4] italic">Tidak ada</span>}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider', st.cls)}>
                            <span className={cn('w-1.5 h-1.5 rounded-full', st.dot)} />{st.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setPreviewApp(row)}
                              className="p-1.5 text-slate-400 hover:text-primary hover:bg-[#eef4ff] rounded-lg transition-colors" title="Lihat Pendaftaran">
                              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>visibility</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
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
                          ? "bg-primary text-white shadow-md shadow-primary/25 scale-105"
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

      {/* Read-Only Preview Application Modal */}
      {previewApp && (() => {
        const st = getAppStatus(previewApp.Status);
        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setPreviewApp(null)}>
            <div className="relative w-full max-w-md glass-card rounded-2xl shadow-none border border-slate-200/60 flex flex-col overflow-hidden max-h-[90vh]"
              onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="relative bg-gradient-to-br from-bku-primary via-[#00308F] to-[#003db5] pt-6 pb-7 px-6 overflow-hidden flex-shrink-0">
                <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full pointer-events-none" />
                <button onClick={() => setPreviewApp(null)}
                  className="absolute z-50 top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-white" style={{ fontSize: '15px' }} >close</span>
                </button>
                <div className="relative z-10 flex items-center gap-4">
                  <StudentAvatar src={previewApp.Mahasiswa?.Foto} name={previewApp.Mahasiswa?.Nama} className="w-14 h-14 rounded-2xl shadow-xl ring-2 ring-white/20" />
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.25em] mb-1">Detail Pendaftaran</p>
                    <h2 className="text-base font-extrabold font-headline leading-tight truncate" style={{ color: 'var(--theme-h2)' }}>{previewApp.Mahasiswa?.Nama}</h2>
                    <p className="text-xs text-blue-200 font-medium mt-0.5">{previewApp.Mahasiswa?.NIM}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4 overflow-y-auto flex-1 font-inter">
                {/* Scholarship Program */}
                <div className="space-y-1">
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">PROGRAM BEASISWA</span>
                  <p className="text-xs font-black text-slate-800 bg-slate-50 p-3.5 rounded-2xl border border-slate-100/50">
                    {previewApp.Beasiswa?.Nama}
                  </p>
                </div>

                {/* Tanggal Daftar - Full Width */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>calendar_add_on</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">TANGGAL & WAKTU DAFTAR</span>
                    <span className="text-xs font-black text-slate-700">
                      {previewApp.CreatedAt || previewApp.created_at ? formatDateTime(previewApp.CreatedAt || previewApp.created_at) : '—'}
                    </span>
                  </div>
                </div>

                {/* Status Seleksi - Full Width */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0", 
                    previewApp.Status === 'diterima' ? 'bg-emerald-50 text-emerald-600' : 
                    previewApp.Status === 'ditolak' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600')}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>verified</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">STATUS SELEKSI</span>
                    <span className={cn('inline-flex items-center text-[10px] font-black uppercase tracking-wider', 
                      previewApp.Status === 'diterima' ? 'text-emerald-600' : 
                      previewApp.Status === 'ditolak' ? 'text-rose-600' : 'text-amber-600')}>
                      {st.label}
                    </span>
                  </div>
                </div>

                {/* Submitted Files */}
                <div className="space-y-1.5">
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">BERKAS PENDAFTARAN</span>
                  {!previewApp.FileURL && !previewApp.KtmKtpURL && !previewApp.TranskripURL && !previewApp.SertifikatURL ? (
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-dashed border-slate-200 text-center">
                      <p className="text-xs text-slate-400 italic">Tidak ada berkas yang dilampirkan</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {renderAttachment(previewApp.FileURL, "Berkas Utama")}
                      {renderAttachment(previewApp.KtmKtpURL, "KTM / KTP")}
                      {renderAttachment(previewApp.TranskripURL, "Transkrip Nilai")}
                      {renderAttachment(previewApp.SertifikatURL, "Sertifikat Pendukung")}
                    </div>
                  )}
                </div>

                {/* Motivasi */}
                <div className="space-y-1.5">
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">MOTIVASI / MOTIVATION LETTER</span>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                    {previewApp.Motivasi ? (
                      <div 
                        className="text-xs text-slate-700 leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: previewApp.Motivasi }}
                      />
                    ) : (
                      <p className="text-xs text-slate-400 italic">Tidak ada motivasi yang diinputkan</p>
                    )}
                  </div>
                </div>

                {/* Reviewer Notes */}
                <div className="space-y-1.5">
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">CATATAN REVIEWER</span>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100/50">
                    {previewApp.Catatan || 'Belum ada catatan dari reviewer.'}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-slate-200/60 bg-transparent flex gap-3 flex-shrink-0">
                <button onClick={() => setPreviewApp(null)}
                  className="flex-1 h-11 rounded-xl bg-primary hover:bg-bku-hover text-xs font-bold text-white uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md active:scale-95">
                  Tutup Detail
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* View Program Modal */}
      {selectedProgram && (() => {
        const programApps = applications.filter(a => a.BeasiswaID === selectedProgram.ID || a.Beasiswa?.ID === selectedProgram.ID);
        const acceptedApps = programApps.filter(a => a.Status === 'diterima' || a.Status === 'Diterima');
        const current = acceptedApps.length;
        const capacity = selectedProgram.Kuota || 1;
        const pct = current >= capacity ? 100 : Math.min(99, Math.floor((current / capacity) * 100));
        const first5Apps = programApps.slice(0, 5);
        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setSelectedProgram(null)}>
            <div className="relative w-full max-w-md glass-card rounded-2xl shadow-none border border-slate-200/60 flex flex-col overflow-hidden max-h-[90vh]"
              onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="relative bg-gradient-to-br from-bku-primary via-[#00308F] to-[#003db5] pt-6 pb-7 px-6 overflow-hidden flex-shrink-0">
                <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full pointer-events-none" />
                <button onClick={() => setSelectedProgram(null)}
                  className="absolute z-50 top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-white" style={{ fontSize: '15px' }} >close</span>
                </button>
                <div className="flex items-center gap-3">
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.25em] mb-1">Detail Program Beasiswa</p>
                    <h2 className="text-base font-extrabold font-headline leading-tight" style={{ color: 'var(--theme-h2)' }}>{selectedProgram.Nama}</h2>
                    <p className="text-xs text-blue-200 font-medium mt-0.5">{selectedProgram.Penyelenggara}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4 overflow-y-auto flex-1 font-inter">
                {/* Deskripsi */}
                {selectedProgram.Deskripsi && (
                  <div className="space-y-1">
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">DESKRIPSI PROGRAM</span>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/60 p-3.5 rounded-2xl border border-slate-100/50">
                      {selectedProgram.Deskripsi}
                    </p>
                  </div>
                )}

                {/* Tanggal & Waktu Dibuat - Full Width */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>calendar_add_on</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">TANGGAL & WAKTU DIBUAT</span>
                    <span className="text-xs font-black text-slate-700">
                      {selectedProgram.CreatedAt || selectedProgram.created_at ? formatDateTime(selectedProgram.CreatedAt || selectedProgram.created_at) : '—'}
                    </span>
                  </div>
                </div>

                {/* Deadline & IPK Requirement - Side by Side (grid-cols-2) */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 flex-shrink-0">
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>event_busy</span>
                    </div>
                    <div>
                      <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">DEADLINE</span>
                      <span className="text-xs font-black text-rose-600">
                        {selectedProgram.Deadline ? formatDate(selectedProgram.Deadline) : '—'}
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>star</span>
                    </div>
                    <div>
                      <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">MINIMAL IPK</span>
                      <span className="text-xs font-black text-slate-700">{selectedProgram.MinIPK || '3.00'}</span>
                    </div>
                  </div>
                </div>

                {/* Capacity - Full Width */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">KAPASITAS & KETERISIAN</span>
                    <span className="text-xs font-black text-slate-700">{current} / {selectedProgram.Kuota || 0} Mahasiswa</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden mt-2.5">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        pct > 90 
                          ? "bg-rose-500" 
                          : "bg-gradient-to-r from-primary to-blue-400"
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Anggaran - Full Width */}
                {selectedProgram.Anggaran > 0 && (
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>payments</span>
                    </div>
                    <div>
                      <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">TOTAL ANGGARAN</span>
                      <span className="text-xs font-black text-emerald-600">
                        Rp {new Intl.NumberFormat('id-ID').format(selectedProgram.Anggaran)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Applicants List */}
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center justify-between">
                    <span>Pendaftar ({programApps.length})</span>
                    <span className="text-[10px] text-slate-400 lowercase font-medium">menampilkan {first5Apps.length} pendaftar pertama</span>
                  </h3>

                  {first5Apps.length === 0 ? (
                    <div className="bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 py-8 px-4 text-center">
                      <span className="material-symbols-outlined text-slate-300 mb-2" style={{ fontSize: 24 }}>group</span>
                      <p className="text-xs text-slate-400 font-medium">Belum ada mahasiswa yang mendaftar program ini.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {first5Apps.map(app => {
                        const st = getAppStatus(app.Status);
                        return (
                          <div key={app.ID} className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:bg-slate-50/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <StudentAvatar src={app.Mahasiswa?.Foto} name={app.Mahasiswa?.Nama} className="w-8 h-8 rounded-lg" />
                              <div className="min-w-0">
                                <p className="font-bold text-xs text-slate-800 truncate">{app.Mahasiswa?.Nama || '—'}</p>
                                <p className="text-[10px] text-slate-400 font-semibold">{app.Mahasiswa?.NIM || '—'}</p>
                              </div>
                            </div>
                            <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[9px] font-bold border uppercase tracking-wider', st.cls)}>
                              {st.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-slate-200/60 bg-transparent flex gap-3 flex-shrink-0">
                <button onClick={() => setSelectedProgram(null)}
                  className="flex-1 h-11 rounded-xl border border-slate-200/60 bg-white text-xs font-bold text-slate-600 uppercase tracking-widest hover:bg-slate-50 transition-all">
                  Tutup
                </button>
                <button
                  onClick={() => {
                    setSelectedScholarshipFilter(selectedProgram.Nama);
                    setActiveTab('applications');
                    setSelectedProgram(null);
                  }}
                  className="flex-1 h-11 rounded-xl bg-primary hover:bg-bku-hover text-xs font-bold text-white uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md active:scale-95">
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>visibility</span>
                  Lihat Selengkapnya
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  )
}
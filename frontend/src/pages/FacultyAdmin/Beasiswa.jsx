"use client"

import React, { useState, useEffect, useMemo } from 'react'
import api from '../../lib/axios'
import { toast, Toaster } from 'react-hot-toast'
import useAuthStore from '../../store/useAuthStore'
import { cn } from '@/lib/utils'
import { API_BASE_URL } from '../../services/api'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select"
import { Button } from "@/components/ui/Button"
import { StatCard } from '@/components/ui/StatCard'
import { PageContent } from '@/components/ui/page'
import { DashboardHero } from '@/components/ui/dashboard'
import Dialog, { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog"

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

const getShortFacultyName = (name) => {
  if (!name) return '—'
  return name
    .replace(/Fakultas\s+/i, '')
    .replace(/Program\s+Studi\s+/i, '')
    .replace(/Teknologi\s+Informasi/i, 'TI')
    .replace(/Sains\s+dan\s+Teknologi/i, 'Sains & Tek')
    .replace(/Keguruan\s+dan\s+Ilmu\s+Pendidikan/i, 'FKIP')
    .replace(/Ekonomi\s+dan\s+Bisnis/i, 'FEB')
    .replace(/Ilmu\s+Sosial\s+dan\s+Ilmu\s+Politik/i, 'FISIP')
    .trim()
}

const formatCurrency = (val) => {
  if (val === undefined || val === null) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val)
}


const APP_STATUS = {
  diterima: { cls: 'bg-[var(--theme-success-light)] text-[var(--theme-success)] border-[var(--theme-success)]/10', dot: 'bg-[var(--theme-success)]', label: 'Diterima (Final)' },
  ditolak: { cls: 'bg-[var(--theme-error-light)] text-[var(--theme-error)] border-[var(--theme-error)]/10', dot: 'bg-[var(--theme-error)]', label: 'Ditolak (Final)' },
  proses: { cls: 'bg-[var(--theme-warning-light)] text-[var(--theme-warning)] border-[var(--theme-warning)]/10', dot: 'bg-[var(--theme-warning)]', label: 'Proses' },
  'disetujui fakultas': { cls: 'bg-[var(--theme-info-light)] text-[var(--theme-info)] border-[var(--theme-info)]/10', dot: 'bg-[var(--theme-info)]', label: 'Disetujui Fakultas' },
  'ditolak fakultas': { cls: 'bg-[var(--theme-error-light)] text-[var(--theme-error)] border-[var(--theme-error)]/10', dot: 'bg-[var(--theme-error)]', label: 'Ditolak Fakultas' },
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
    <div className="bg-[var(--theme-bg)] p-3 rounded-2xl border border-[var(--theme-border-muted)] flex flex-col gap-2 shadow-sm mb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[var(--theme-error)]" style={{ fontSize: 20 }}>
            {isImage ? 'image' : 'description'}
          </span>
          <div className="text-left">
            <p className="text-xs font-bold text-[var(--theme-text)] truncate max-w-[200px]">
              {label}
            </p>
            <p className="text-[9px] text-[var(--theme-text-muted)]">Klik untuk melihat file</p>
          </div>
        </div>
        <a href={fullUrl} target="_blank" rel="noreferrer" className="text-[var(--theme-primary)] hover:bg-[var(--theme-primary-light)] p-1.5 rounded-lg transition-colors">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>open_in_new</span>
        </a>
      </div>
      {isImage && (
        <a href={fullUrl} target="_blank" rel="noreferrer" className="mt-1 block rounded-xl overflow-hidden border border-[var(--theme-border)] hover:opacity-90 transition-opacity">
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
  const [facultyInfo, setFacultyInfo] = useState(null)

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

  const getKopImage = (facName) => {
    const name = (facName || "").toLowerCase();
    if (name.includes("farmasi")) return "kop_farmasi.jpg";
    if (name.includes("kesehatan") || name.includes("fikes")) return "kop_ilmu_kesehatan.jpg";
    if (name.includes("keperawatan") || name.includes("fkep")) return "kop_keperawatan.jpg";
    if (name.includes("sosial") || name.includes("social") || name.includes("sosiologi") || name.includes("fis")) return "kop_ilmu_sosial.jpg";
    return "kop_farmasi.jpg";
  };

  const downloadPDF = (title, subtitle, contentHtml) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) { toast.error('Gagal membuka jendela cetak. Pastikan pop-up tidak diblokir.'); return; }

    const user = useAuthStore.getState().user;
    const isSuperAdmin = user?.role === 'super_admin';

    const facName = facultyInfo?.Nama || facultyInfo?.nama || "Fakultas Farmasi";
    const facDekan = facultyInfo?.Dekan || facultyInfo?.dekan || "Dekan Bidang Akademik";

    const printSize = isSuperAdmin ? 'A4 landscape' : 'A4 portrait';
    const bgSize = isSuperAdmin ? '297mm 210mm' : '210mm 297mm';
    const kopImage = isSuperAdmin ? 'format_kop_rektorat_landscape.jpg' : getKopImage(facName);
    const kopImageUrl = `${window.location.origin}/images/${kopImage}`;
    const facNameResolved = isSuperAdmin ? 'Universitas Bhakti Kencana' : facName;
    const titleResolved = isSuperAdmin ? 'Rektor Universitas Bhakti Kencana' : `Dekan ${facNameResolved}`;
    const nameResolved = isSuperAdmin ? 'Dr. apt. Entris Sutrisno, MH. Kes.' : facDekan;
    const footerText = isSuperAdmin ? 'Portal SIAKAD Rektorat BKU' : `Portal Akademik ${facNameResolved}`;

    const htmlContent = `<html><head><meta charset="utf-8"><title>${title}</title><style>
      @page { size: ${printSize}; margin: 0; }
      body {
        font-family: 'Segoe UI', Arial, sans-serif;
        line-height: 1.5;
        color: #334155;
        background-image: url('${kopImageUrl}');
        background-size: ${bgSize};
        background-repeat: no-repeat;
        background-position: top center;
        margin: 0;
        padding: 38mm 18mm 20mm 18mm;
        box-sizing: border-box;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
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
      @media print { .no-print { display:none; } }
    </style></head><body>
      <h1>${title}</h1>
      <h2>${subtitle}</h2>
      ${contentHtml}
      <div class="footer">
        <p>Dicetak secara otomatis oleh ${footerText}</p>
        <p>Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB</p>
        <br/><p>Mengetahui,</p>
        <p style="font-weight:700;margin-top:4px;">${titleResolved}</p>
        <div style="margin-top:45px; font-weight:700; text-decoration:underline;">${nameResolved}</div>
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
        FakultasNama: m.Fakultas?.Nama || m.Fakultas?.nama || m.fakultas?.nama || m.fakultas?.Nama || m.ProgramStudi?.Fakultas?.Nama || m.ProgramStudi?.Fakultas?.nama || '—',
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
      try {
        const profileRes = await api.get('/faculty/profile')
        if (profileRes.data?.success && profileRes.data?.data?.fakultas) {
          setFacultyInfo(profileRes.data.data.fakultas)
        }
      } catch (err) {
        console.error("Failed to fetch faculty profile", err)
      }

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

  const stats = useMemo(() => {
    const totalPrograms = scholarships.length
    const aktif = scholarships.filter(s => new Date(s.Deadline) > new Date()).length
    const pendingApps = applications.filter(a => (a.Status || 'proses').toLowerCase() === 'proses').length
    const activeAwardees = applications.filter(a => (a.Status || '').toLowerCase() === 'diterima').length
    const totalBudget = scholarships.reduce((acc, curr) => acc + (curr.Anggaran || curr.anggaran || 0), 0)
    return { totalPrograms, aktif, pendingApps, activeAwardees, totalBudget }
  }, [scholarships, applications])

  const absorbedBudget = useMemo(() => {
    return applications
      .filter(a => (a.Status || '').toLowerCase() === 'diterima')
      .reduce((acc, curr) => {
        const program = scholarships.find(p => (p.ID || p.id) === curr.BeasiswaID)
        const val = program ? (program.NilaiBantuan || program.nilai_bantuan || 0) : 0
        return acc + val
      }, 0)
  }, [scholarships, applications])

  const remainingBudget = stats.totalBudget - absorbedBudget
  const absorptionRate = stats.totalBudget > 0 ? Math.round((absorbedBudget / stats.totalBudget) * 100) : 0

  const facultyApplicants = useMemo(() => {
    const counts = {}
    applications.forEach(a => {
      const facName = a.Mahasiswa?.FakultasNama || 'Tidak ada data'
      counts[facName] = (counts[facName] || 0) + 1
    })
    return Object.entries(counts).map(([name, count]) => ({ name, count }))
  }, [applications])

  const highestApplicantFaculty = useMemo(() => {
    if (facultyApplicants.length === 0) return { name: '—', count: 0 }
    return facultyApplicants.reduce((max, curr) => curr.count > max.count ? curr : max, { name: '—', count: 0 })
  }, [facultyApplicants])

  const lowestApplicantFaculty = useMemo(() => {
    const validFacs = facultyApplicants.filter(f => f.name !== 'Tidak ada data' && f.name !== '—')
    if (validFacs.length === 0) return { name: '—', count: 0 }
    return validFacs.reduce((min, curr) => curr.count < min.count ? curr : min, { name: '—', count: Infinity })
  }, [facultyApplicants])

  const TABS = [
    { key: 'programs', label: 'Program Beasiswa', icon: GraduationCap },
    { key: 'applications', label: 'Review Pendaftar', icon: Users },
  ]

  return (
    <PageContent>
      <Toaster position="top-right" />
        <DashboardHero
          title="Manajemen "
          highlightedTitle="Beasiswa"
          subtitle="Kelola program beasiswa dan verifikasi pendaftaran mahasiswa di lingkungan fakultas."
          icon="school"
          badges={[
            { label: 'Program Bantuan Akademik', active: false },
            { label: `${stats.aktif} Program Aktif`, active: true }
          ]}
          actions={
            <>
              <div className="hidden lg:flex items-center gap-2 text-right">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Program</span>
                <span className="text-sm font-extrabold text-primary px-2 py-0.5 rounded-md bg-[#eef4ff] border border-blue-100">{stats.totalPrograms}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={exportBeasiswaPDF} disabled={loading || (activeTab === 'programs' ? scholarships.length === 0 : applications.length === 0)}
                  className="h-10 px-4 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-sm text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-primary hover:border-primary/30 hover:bg-slate-50/50 shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-50 flex items-center gap-2">
                  <Download size={13} className="text-primary" /> Ekspor PDF
                </button>
                <button onClick={fetchData} disabled={loading}
                  className="h-10 px-4 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-sm text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-primary hover:border-primary/30 hover:bg-slate-50/50 shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-60 flex items-center gap-2">
                  {loading ? <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '13px' }} >sync</span> : <RefreshCw size={13} className="text-primary" />} Refresh Data
                </button>
              </div>
            </>
          }
        />

        {/* Stats */}
        <div className="space-y-4 md:space-y-5">
          {/* Row 1: Utama (4 Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            <StatCard
              label="Total Beasiswa"
              value={stats.totalPrograms}
              description="Program terdaftar"
              icon="school"
              color="text-primary"
              bg="bg-primary/10"
              loading={loading}
            />
            <StatCard
              label="Program Aktif"
              value={stats.aktif}
              description="Deadline belum lewat"
              icon="schedule"
              color="text-emerald-600"
              bg="bg-emerald-50"
              loading={loading}
            />
            <StatCard
              label="Pendaftar Baru"
              value={stats.pendingApps}
              description="Sedang diproses"
              icon="group"
              color="text-amber-600"
              bg="bg-amber-50"
              loading={loading}
            />
            <StatCard
              label="Lolos Seleksi"
              value={stats.activeAwardees}
              description="Diterima beasiswa"
              icon="check_circle"
              color="text-indigo-600"
              bg="bg-indigo-50"
              loading={loading}
            />
          </div>

          {/* Row 2: Analytics & Budget (4 Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            <StatCard
              label="Pendaftar Terbanyak"
              value={getShortFacultyName(highestApplicantFaculty.name)}
              description={`${highestApplicantFaculty.count} Pendaftar`}
              icon="trending_up"
              color="text-primary"
              bg="bg-primary/10"
              loading={loading}
            />
            <StatCard
              label="Pendaftar Terendah"
              value={getShortFacultyName(lowestApplicantFaculty.name)}
              description={`${lowestApplicantFaculty.count} Pendaftar`}
              icon="trending_down"
              color="text-rose-600"
              bg="bg-rose-50"
              loading={loading}
            />
            <StatCard
              label="Total Anggaran"
              value={formatCurrency(stats.totalBudget)}
              description="Proyeksi dana fakultas"
              icon="payments"
              color="text-info"
              bg="bg-info/10"
              loading={loading}
            />
            <StatCard
              label="Realisasi Anggaran"
              value={formatCurrency(absorbedBudget)}
              description={`${absorptionRate}% Anggaran terserap`}
              icon="account_balance_wallet"
              color="text-emerald-600"
              bg="bg-emerald-50"
              loading={loading}
            />
          </div>
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
                          <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider whitespace-nowrap', st.cls)}>
                            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', st.dot)} />{st.label}
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

      {/* Read-Only Preview Application Modal */}
      {previewApp && (() => {
        const st = getAppStatus(previewApp.Status);
        return (
          <Dialog open={!!previewApp} onOpenChange={(open) => !open && setPreviewApp(null)} maxWidth="max-w-md">
            <DialogContent className="max-w-md p-0 overflow-hidden border border-[var(--theme-border)] shadow-2xl rounded-2xl bg-[var(--theme-surface)] flex flex-col max-h-[90vh]">
              {/* Header */}
              <DialogHeader className="shrink-0 relative bg-[var(--theme-bg)]/50 p-6 pb-5 border-b border-[var(--theme-border-muted)]">
                <div className="relative z-10 flex items-center gap-4">
                  <StudentAvatar src={previewApp.Mahasiswa?.Foto} name={previewApp.Mahasiswa?.Nama} className="w-14 h-14 rounded-2xl shadow-inner ring-2 ring-[var(--theme-border)]" />
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-[0.25em] mb-1">Detail Pendaftaran</p>
                    <DialogTitle className="text-base font-bold font-headline leading-tight truncate text-[var(--theme-text)]">{previewApp.Mahasiswa?.Nama}</DialogTitle>
                    <DialogDescription className="text-xs text-[var(--theme-text-muted)] mt-0.5">{previewApp.Mahasiswa?.NIM}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* Content */}
              <div className="p-6 space-y-4 overflow-y-auto flex-1 font-inter">
                {/* Scholarship Program */}
                <div className="space-y-1">
                  <span className="block text-[8px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">PROGRAM BEASISWA</span>
                  <p className="text-xs font-semibold text-[var(--theme-text)] bg-[var(--theme-bg)] p-3.5 rounded-2xl border border-[var(--theme-border-muted)]">
                    {previewApp.Beasiswa?.Nama}
                  </p>
                </div>

                {/* Tanggal Daftar - Full Width */}
                <div className="bg-[var(--theme-bg)] p-3.5 rounded-2xl border border-[var(--theme-border-muted)] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[var(--theme-info-light)] flex items-center justify-center text-[var(--theme-info)] flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>calendar_add_on</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-0.5">TANGGAL & WAKTU DAFTAR</span>
                    <span className="text-xs font-semibold text-[var(--theme-text)]">
                      {formatDateTime(previewApp.CreatedAt || previewApp.created_at)}
                    </span>
                  </div>
                </div>

                {/* Status Seleksi - Full Width */}
                <div className="bg-[var(--theme-bg)] p-3.5 rounded-2xl border border-[var(--theme-border-muted)] flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0",
                    previewApp.Status === 'diterima' ? 'bg-[var(--theme-success-light)] text-[var(--theme-success)]' :
                      previewApp.Status === 'ditolak' ? 'bg-[var(--theme-error-light)] text-[var(--theme-error)]' : 'bg-[var(--theme-warning-light)] text-[var(--theme-warning)]')}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>verified</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-0.5">STATUS SELEKSI</span>
                    <span className={cn('inline-flex items-center text-[10px] font-semibold uppercase tracking-wider',
                      previewApp.Status === 'diterima' ? 'text-[var(--theme-success)]' :
                        previewApp.Status === 'ditolak' ? 'text-[var(--theme-error)]' : 'text-[var(--theme-warning)]')}>
                      {st.label}
                    </span>
                  </div>
                </div>

                {/* Submitted Files */}
                <div className="space-y-1.5">
                  <span className="block text-[8px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">BERKAS PENDAFTARAN</span>
                  {!previewApp.FileURL && !previewApp.KtmKtpURL && !previewApp.TranskripURL && !previewApp.SertifikatURL ? (
                    <div className="bg-[var(--theme-bg)]/50 p-4 rounded-2xl border border-dashed border-[var(--theme-border)] text-center">
                      <p className="text-xs text-[var(--theme-text-subtle)] italic">Tidak ada berkas yang dilampirkan</p>
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

                {/* Custom Answers in Preview */}
                {(() => {
                  const rawAnswers = previewApp.custom_answers || previewApp.CustomAnswers;
                  if (!rawAnswers) return null;
                  let answers = {};
                  try {
                    answers = typeof rawAnswers === 'string' ? JSON.parse(rawAnswers) : rawAnswers;
                  } catch (e) {
                    console.error(e);
                    return null;
                  }
                  if (Object.keys(answers).length === 0) return null;
                  return (
                    <div className="space-y-1.5 text-left">
                      <span className="block text-[8px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">JAWABAN PERSYARATAN KUSTOM</span>
                      <div className="space-y-2">
                        {Object.entries(answers).map(([label, value]) => {
                          const isFile = typeof value === 'string' && (value.startsWith('/uploads/') || value.startsWith('http') || value.includes('/api/scholarship/upload-custom-file'));
                          return (
                            <div key={label} className="bg-[var(--theme-bg)] p-3 rounded-2xl border border-[var(--theme-border-muted)]">
                              <span className="block text-[9px] font-bold text-[var(--theme-text-muted)] uppercase">{label}</span>
                              {isFile ? (
                                <div className="mt-1">
                                  {renderAttachment(value, label)}
                                </div>
                              ) : (
                                <p className="text-xs font-semibold text-[var(--theme-text)] mt-1 whitespace-pre-line">
                                  {Array.isArray(value) ? value.join(', ') : String(value)}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Motivasi */}
                <div className="space-y-1.5">
                  <span className="block text-[8px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">MOTIVASI / MOTIVATION LETTER</span>
                  <div className="bg-[var(--theme-bg)] p-4 rounded-2xl border border-[var(--theme-border-muted)]">
                    {previewApp.Motivasi ? (
                      <div
                        className="text-xs text-[var(--theme-text)] leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: previewApp.Motivasi }}
                      />
                    ) : (
                      <p className="text-xs text-[var(--theme-text-subtle)] italic">Tidak ada motivasi yang diinputkan</p>
                    )}
                  </div>
                </div>

                {/* Reviewer Notes */}
                <div className="space-y-1.5">
                  <span className="block text-[8px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">CATATAN REVIEWER</span>
                  <p className="text-xs text-[var(--theme-text)] leading-relaxed bg-[var(--theme-bg)] p-3.5 rounded-2xl border border-[var(--theme-border-muted)]">
                    {previewApp.Catatan || 'Belum ada catatan dari reviewer.'}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <DialogFooter className="px-5 py-4 border-t border-[var(--theme-border-muted)] bg-transparent flex justify-end gap-3 flex-shrink-0">
                <button onClick={() => setPreviewApp(null)}
                  className="w-full h-10 px-6 rounded-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-xs font-semibold text-white uppercase tracking-wider transition-all active:scale-95 shadow-md cursor-pointer">
                  Tutup Detail
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
          <Dialog open={!!selectedProgram} onOpenChange={(open) => !open && setSelectedProgram(null)} maxWidth="max-w-md">
            <DialogContent className="max-w-md p-0 overflow-hidden border border-[var(--theme-border)] shadow-2xl rounded-2xl bg-[var(--theme-surface)] flex flex-col max-h-[90vh]">
              {/* Header */}
              <DialogHeader className="shrink-0 relative bg-[var(--theme-bg)]/50 p-6 pb-5 border-b border-[var(--theme-border-muted)]">
                <div className="flex items-center gap-3">
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-[0.25em] mb-1">Detail Program Beasiswa</p>
                    <DialogTitle className="text-base font-bold font-headline leading-tight text-[var(--theme-text)]">{selectedProgram.Nama}</DialogTitle>
                    <DialogDescription className="text-xs text-[var(--theme-text-muted)] mt-0.5">{selectedProgram.Penyelenggara}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* Content */}
              <div className="p-6 space-y-4 overflow-y-auto flex-1 font-inter">
                {/* Deskripsi */}
                {selectedProgram.Deskripsi && (
                  <div className="space-y-1">
                    <span className="block text-[8px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">DESKRIPSI PROGRAM</span>
                    <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed bg-[var(--theme-bg)]/60 p-3.5 rounded-2xl border border-[var(--theme-border-muted)]">
                      {selectedProgram.Deskripsi}
                    </p>
                  </div>
                )}

                {/* Persyaratan Kustom */}
                {(() => {
                  const rawFields = selectedProgram.CustomFields || selectedProgram.custom_fields;
                  if (!rawFields) return null;
                  let fields = [];
                  try {
                    fields = typeof rawFields === 'string' ? JSON.parse(rawFields) : rawFields;
                  } catch (e) {
                    console.error(e);
                  }
                  if (!Array.isArray(fields) || fields.length === 0) return null;
                  return (
                    <div className="space-y-1">
                      <span className="block text-[8px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">PERSYARATAN TAMBAHAN (KUSTOM)</span>
                      <div className="bg-[var(--theme-bg)]/60 p-3.5 rounded-2xl border border-[var(--theme-border-muted)] space-y-2 font-inter">
                        {fields.map((f, i) => (
                          <div key={i} className="flex justify-between items-start text-xs border-b border-[var(--theme-border-muted)] last:border-0 pb-1.5 last:pb-0">
                            <div className="min-w-0 pr-2 text-left">
                              <span className="font-bold text-[var(--theme-text)] block">{f.label}</span>
                              {f.options && (
                                <span className="text-[9px] text-[var(--theme-text-muted)] block mt-0.5">Opsi: {f.options}</span>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <span className="font-semibold text-[9px] px-1.5 py-0.5 bg-[var(--theme-info-light)] text-[var(--theme-info)] rounded">
                                {f.type}
                              </span>
                              {f.required && (
                                <span className="font-bold text-[8px] px-1 bg-[var(--theme-error-light)] text-[var(--theme-error)] rounded">
                                  Wajib
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Tanggal & Waktu Dibuat - Full Width */}
                <div className="bg-[var(--theme-bg)] p-3.5 rounded-2xl border border-[var(--theme-border-muted)] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[var(--theme-info-light)] flex items-center justify-center text-[var(--theme-info)] flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>calendar_add_on</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-0.5">TANGGAL & WAKTU DIBUAT</span>
                    <span className="text-xs font-semibold text-[var(--theme-text)]">
                      {selectedProgram.CreatedAt || selectedProgram.created_at ? formatDateTime(selectedProgram.CreatedAt || selectedProgram.created_at) : '—'}
                    </span>
                  </div>
                </div>

                {/* Deadline & IPK Requirement - Side by Side (grid-cols-2) */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-[var(--theme-bg)] p-3 rounded-2xl border border-[var(--theme-border-muted)] flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[var(--theme-error-light)] flex items-center justify-center text-[var(--theme-error)] flex-shrink-0">
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>event_busy</span>
                    </div>
                    <div>
                      <span className="block text-[8px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-0.5">DEADLINE</span>
                      <span className="text-xs font-semibold text-[var(--theme-error)]">
                        {selectedProgram.Deadline ? formatDate(selectedProgram.Deadline) : '—'}
                      </span>
                    </div>
                  </div>
                  <div className="bg-[var(--theme-bg)] p-3 rounded-2xl border border-[var(--theme-border-muted)] flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[var(--theme-warning-light)] flex items-center justify-center text-[var(--theme-warning)] flex-shrink-0">
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>star</span>
                    </div>
                    <div>
                      <span className="block text-[8px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-0.5">MINIMAL IPK</span>
                      <span className="text-xs font-semibold text-[var(--theme-text)]">{selectedProgram.MinIPK || '3.00'}</span>
                    </div>
                  </div>
                </div>

                {/* Capacity - Full Width */}
                <div className="bg-[var(--theme-bg)] p-3.5 rounded-2xl border border-[var(--theme-border-muted)] flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">KAPASITAS & KETERISIAN</span>
                    <span className="text-xs font-semibold text-[var(--theme-text)]">{current} / {selectedProgram.Kuota || 0} Mahasiswa</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--theme-border-muted)] rounded-full overflow-hidden mt-2.5">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        pct > 90
                          ? "bg-[var(--theme-error)]"
                          : "bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-info)]"
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Anggaran - Full Width */}
                {selectedProgram.Anggaran > 0 && (
                  <div className="bg-[var(--theme-bg)] p-3.5 rounded-2xl border border-[var(--theme-border-muted)] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[var(--theme-success-light)] flex items-center justify-center text-[var(--theme-success)] flex-shrink-0">
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>payments</span>
                    </div>
                    <div>
                      <span className="block text-[8px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-0.5">TOTAL ANGGARAN</span>
                      <span className="text-xs font-semibold text-[var(--theme-success)]">
                        Rp {new Intl.NumberFormat('id-ID').format(selectedProgram.Anggaran)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Applicants List */}
                <div>
                  <h3 className="text-xs font-bold text-[var(--theme-text)] uppercase tracking-wider mb-3 flex items-center justify-between">
                    <span>Pendaftar ({programApps.length})</span>
                    <span className="text-[10px] text-[var(--theme-text-muted)] lowercase font-medium">menampilkan {first5Apps.length} pendaftar pertama</span>
                  </h3>

                  {first5Apps.length === 0 ? (
                    <div className="bg-[var(--theme-bg)]/50 rounded-2xl border border-dashed border-[var(--theme-border)] py-8 px-4 text-center">
                      <span className="material-symbols-outlined text-[var(--theme-text-subtle)] mb-2" style={{ fontSize: 24 }}>group</span>
                      <p className="text-xs text-[var(--theme-text-muted)] font-medium">Belum ada mahasiswa yang mendaftar program ini.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {first5Apps.map(app => {
                        const st = getAppStatus(app.Status);
                        return (
                          <div key={app.ID} className="flex items-center justify-between p-3 rounded-2xl border border-[var(--theme-border-muted)] hover:bg-[var(--theme-bg)]/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <StudentAvatar src={app.Mahasiswa?.Foto} name={app.Mahasiswa?.Nama} className="w-8 h-8 rounded-lg" />
                              <div className="min-w-0">
                                <p className="font-bold text-xs text-[var(--theme-text)] truncate">{app.Mahasiswa?.Nama || '—'}</p>
                                <p className="text-[10px] text-[var(--theme-text-muted)] font-semibold">{app.Mahasiswa?.NIM || '—'}</p>
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
              <DialogFooter className="px-5 py-4 border-t border-[var(--theme-border-muted)] bg-transparent flex gap-3 flex-shrink-0 sm:flex-row sm:justify-stretch sm:space-x-0">
                <button onClick={() => setSelectedProgram(null)}
                  className="flex-1 h-10 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] text-xs font-semibold text-[var(--theme-text)] uppercase tracking-wider hover:bg-[var(--theme-bg)] transition-all cursor-pointer">
                  Tutup
                </button>
                <button
                  onClick={() => {
                    setSelectedScholarshipFilter(selectedProgram.Nama);
                    setActiveTab('applications');
                    setSelectedProgram(null);
                  }}
                  className="flex-1 h-10 rounded-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-xs font-semibold text-white uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer">
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>visibility</span>
                  Lihat Selengkapnya
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}
    </PageContent>
  )
}
"use client"

import React, { useState, useEffect, useMemo } from "react"
import api from "../../lib/axios"
import { pddiktiService, API_BASE_URL } from "../../services/api"

import { toast, Toaster } from "react-hot-toast"
import { cn } from "@/lib/utils"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./components/select"
import { Button } from "./components/button"

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const RefreshCw = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>sync</span>;
const Icon = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>info</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Layers = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>layers</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Phone = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>phone</span>;
const Mail = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>mail</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Users = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>group</span>;
const UserCheck = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>how_to_reg</span>;
const GraduationCap = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>school</span>;
const Calendar = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>calendar_today</span>;
const BookOpen = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>menu_book</span>;
const Building2 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>business</span>;
const Award = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>emoji_events</span>;
const FileText = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>description</span>;
const MapPin = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>location_on</span>;
const Heart = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>favorite</span>;



const STATUS_STYLES = {
  'Aktif': { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  'active': { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  'Lulus': { cls: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500' },
  'Cuti': { cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  'leave': { cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  'Non-Aktif': { cls: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
}

const AVATAR_COLORS = [
  'from-blue-400 to-indigo-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-500',
  'from-violet-400 to-purple-500',
  'from-cyan-400 to-sky-500',
]

const formatDate = (d) => {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) }
  catch { return d }
}

const getFullUrl = (path) => {
  if (!path || path.trim() === "" || path === "/" || path.endsWith("/profiles/") || path.endsWith("/students/")) return null;
  if (path.startsWith('http')) return path;
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}${path}`;
}

const mapStudent = (m, i) => {
  const statusAkun = m.StatusAkun || 'Aktif'
  const isLulus = String(statusAkun).toLowerCase() === 'lulus'
  return {
    ID: m.ID, NIM: m.NIM, Nama: m.Nama,
    ProgramStudi: m.ProgramStudi?.Nama || '—',
    SemesterSekarang: isLulus ? null : (m.SemesterSekarang > 0 ? m.SemesterSekarang : 1),
    StatusAkun: statusAkun,
    StatusAkademik: m.StatusAkademik || '—',
    TahunMasuk: m.TahunMasuk ? String(m.TahunMasuk) : (m.NIM ? `20${m.NIM.substring(0, 2)}` : '—'),
    NoHP: m.NoHP || '—',
    JalurMasuk: m.JalurMasuk || 'PDDIKTI Sync',
    TempatLahir: m.TempatLahir || '—',
    TanggalLahir: m.TanggalLahir,
    NIK: m.NIK || '—',
    Email: m.EmailKampus || m.Pengguna?.Email || '—',
    Alamat: m.Alamat || '—',
    NamaAyah: m.NamaAyah || '—',
    NamaIbu: m.NamaIbuKandung || '—',
    PekerjaanOrtu: m.PekerjaanAyah || m.PekerjaanIbu || '—',
    PenghasilanOrtu: m.PenghasilanOrtu,
    colorIdx: i % AVATAR_COLORS.length,
    Foto: getFullUrl(m.FotoURL || m.foto_url || m.Foto || m.Pengguna?.Foto || null),
  }
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


export default function MahasiswaPage() {
  const [studentData, setStudentData] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterSemester, setFilterSemester] = useState('all')
  const [filterProdi, setFilterProdi] = useState('all')
  const [filterAngkatan, setFilterAngkatan] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortConfig, setSortConfig] = useState({ key: 'Nama', direction: 'asc' })

  const fetchStudents = React.useCallback(async () => {
    Promise.resolve().then(() => setLoading(true))
    try {
      const res = await api.get('/faculty/students')
      setStudentData((res?.data?.data || []).map(mapStudent))
    } catch { toast.error("Gagal memuat data mahasiswa") }
    finally {
      Promise.resolve().then(() => setLoading(false))
    }
  }, [])

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      await pddiktiService.fetchData('Universitas Bhakti Kencana', 'mhs')
      await fetchStudents()
      toast.success('Sinkronisasi selesai')
    } catch { toast.error('Gagal sinkronisasi dari PDDIKTI') }
    finally { setIsSyncing(false) }
  }

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
      .badge-aktif   { background:#dcfce7; color:#15803d; border:1px solid #bbf7d0; }
      .badge-lulus   { background:#e0f2fe; color:#0284c7; border:1px solid #bae6fd; }
      .badge-cuti    { background:#fef9c3; color:#a16207; border:1px solid #fef08a; }
      .badge-nonaktif{ background:#fee2e2; color:#b91c1c; border:1px solid #fecaca; }
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
      <script>window.onload=function(){setTimeout(function(){window.print();setTimeout(function(){window.close();},100);},300);};</script>
    </body></html>`;
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const exportStudentsPDF = () => {
    if (studentData.length === 0) { toast.error('Tidak ada data mahasiswa untuk diekspor'); return; }
    const dataToExport = filtered.length > 0 && filtered.length < studentData.length ? filtered : studentData;
    const statusBadge = (s) => {
      const key = (s||'').toLowerCase();
      if (key === 'aktif' || key === 'active') return '<span class="badge badge-aktif">Aktif</span>';
      if (key === 'lulus') return '<span class="badge badge-lulus">Lulus</span>';
      if (key === 'cuti' || key === 'leave') return '<span class="badge badge-cuti">Cuti</span>';
      return '<span class="badge badge-nonaktif">Non-Aktif</span>';
    };
    let tableRows = '';
    dataToExport.forEach((item, idx) => {
      tableRows += `<tr>
        <td>${idx + 1}</td>
        <td style="font-family:monospace;font-weight:700;color:#00236F;font-size:7.5px;">${item.NIM||'—'}</td>
        <td style="font-weight:700;">${item.Nama||'—'}</td>
        <td>${item.ProgramStudi||'—'}</td>
        <td style="text-align:center;font-weight:700;">${item.SemesterSekarang||'—'}</td>
        <td>${item.TahunMasuk||'—'}</td>
        <td>${item.JalurMasuk||'—'}</td>
        <td>${statusBadge(item.StatusAkun)}</td>
      </tr>`;
    });
    const aktif  = dataToExport.filter(d => d.StatusAkun === 'Aktif' || d.StatusAkun === 'active').length;
    const lulus  = dataToExport.filter(d => d.StatusAkun === 'Lulus').length;
    const cuti   = dataToExport.filter(d => d.StatusAkun === 'Cuti'  || d.StatusAkun === 'leave').length;
    const contentHtml = `
      <table style="width:100%;border-collapse:collapse;border:none;margin-bottom:16px;">
        <tr>
          <td style="padding:0 5px 0 0;width:25%;">
            <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:10px 12px;border-radius:5px;">
              <div style="font-size:7px;font-weight:700;color:#64748b;text-transform:uppercase;">Total Mahasiswa</div>
              <div style="font-size:14px;font-weight:700;color:#00236F;">${dataToExport.length} Orang</div>
            </div>
          </td>
          <td style="padding:0 5px;width:25%;">
            <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:10px 12px;border-radius:5px;">
              <div style="font-size:7px;font-weight:700;color:#64748b;text-transform:uppercase;">Aktif</div>
              <div style="font-size:14px;font-weight:700;color:#15803d;">${aktif} Orang</div>
            </div>
          </td>
          <td style="padding:0 5px;width:25%;">
            <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:10px 12px;border-radius:5px;">
              <div style="font-size:7px;font-weight:700;color:#64748b;text-transform:uppercase;">Lulus</div>
              <div style="font-size:14px;font-weight:700;color:#0284c7;">${lulus} Orang</div>
            </div>
          </td>
          <td style="padding:0 0 0 5px;width:25%;">
            <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:10px 12px;border-radius:5px;">
              <div style="font-size:7px;font-weight:700;color:#64748b;text-transform:uppercase;">Cuti</div>
              <div style="font-size:14px;font-weight:700;color:#d97706;">${cuti} Orang</div>
            </div>
          </td>
        </tr>
      </table>
      <table class="data-table">
        <thead><tr>
          <th style="width:4%;">No</th>
          <th style="width:12%;">NIM</th>
          <th style="width:22%;">Nama Mahasiswa</th>
          <th style="width:22%;">Program Studi</th>
          <th style="width:6%;text-align:center;">Smt</th>
          <th style="width:8%;">Angkatan</th>
          <th style="width:14%;">Jalur Masuk</th>
          <th style="width:9%;">Status</th>
        </tr></thead>
        <tbody>${tableRows}</tbody>
      </table>`;
    downloadPDF(
      'Daftar Database Mahasiswa Fakultas',
      `Rekap Data Akademik Mahasiswa — ${new Date().toLocaleDateString('id-ID', { month:'long', year:'numeric' })}`,
      contentHtml
    );
    toast.success(`Berhasil mencetak ${dataToExport.length} data mahasiswa!`);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStudents()
  }, [fetchStudents])

  const statusList = useMemo(() => {
    return [...new Set(studentData.map(d => d.StatusAkun).filter(Boolean))]
  }, [studentData])

  const semesterList = useMemo(() => {
    return [...new Set(studentData.map(d => d.SemesterSekarang).filter(s => s !== null && s !== undefined && s > 0))].sort((a, b) => a - b)
  }, [studentData])

  const prodiList = useMemo(() => {
    return [...new Set(studentData.map(d => d.ProgramStudi).filter(s => s && s !== '—'))].sort()
  }, [studentData])

  const angkatanList = useMemo(() => {
    return [...new Set(studentData.map(d => d.TahunMasuk).filter(s => s && s !== '—'))].sort()
  }, [studentData])

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const filtered = useMemo(() =>
    studentData.filter(d => {
      const q = search.toLowerCase()
      const matchQ = !q || d.Nama?.toLowerCase().includes(q) || d.NIM?.includes(q) || d.ProgramStudi?.toLowerCase().includes(q)
      const matchS = filterStatus === 'all' || d.StatusAkun === filterStatus
      const matchSem = filterSemester === 'all' || String(d.SemesterSekarang) === filterSemester
      const matchPr = filterProdi === 'all' || d.ProgramStudi === filterProdi
      const matchAng = filterAngkatan === 'all' || d.TahunMasuk === filterAngkatan
      return matchQ && matchS && matchSem && matchPr && matchAng
    })
    , [studentData, search, filterStatus, filterSemester, filterProdi, filterAngkatan])

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
    total: studentData.length,
    aktif: studentData.filter(d => d.StatusAkun === 'Aktif' || d.StatusAkun === 'active').length,
    lulus: studentData.filter(d => d.StatusAkun === 'Lulus').length,
    cuti: studentData.filter(d => d.StatusAkun === 'Cuti' || d.StatusAkun === 'leave').length,
  }

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
                  <span className="material-symbols-outlined text-primary relative z-10 transition-transform duration-300 group-hover/icon:scale-110" style={{ fontSize: '26px' }}>group</span>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-primary/5 text-primary border border-primary/10">
                      Data Akademik
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {stats.aktif} Mahasiswa Aktif
                    </span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-headline leading-none">
                    Database <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Mahasiswa</span>
                  </h1>
                </div>
              </div>

              {/* Perfectly aligned description block */}
              <p className="text-slate-500 font-medium text-xs md:text-sm max-w-3xl leading-relaxed mt-3 pl-0 md:pl-[72px]">
                Manajemen data dan arsip akademik seluruh mahasiswa di lingkungan fakultas.
              </p>
            </div>

            {/* Action and quick count balance box */}
            <div className="flex flex-row lg:flex-col items-end gap-3 shrink-0 self-stretch lg:self-auto justify-between lg:justify-center border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
              <div className="flex items-center gap-2">
                <button onClick={exportStudentsPDF} disabled={loading || studentData.length === 0}
                  className="h-10 px-4 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-sm text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-primary hover:border-primary/30 hover:bg-slate-50/50 shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-50 flex items-center gap-2">
                  <FileText size={13} className="text-primary" /> Ekspor PDF
                </button>
                <button onClick={handleSync} disabled={isSyncing}
                  className="h-10 px-4 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-sm text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-primary hover:border-primary/30 hover:bg-slate-50/50 shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-60 flex items-center gap-2">
                  {isSyncing ? <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '13px' }} >sync</span> : <RefreshCw size={13} className="text-primary" />} {isSyncing ? 'Syncing...' : 'PDDIKTI Sync'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Mahasiswa', value: stats.total, icon: Users, bg: 'bg-[#eef4ff]', color: 'text-primary', desc: 'Terdaftar di sistem' },
            { label: 'Aktif', value: stats.aktif, icon: UserCheck, bg: 'bg-emerald-50', color: 'text-emerald-600', desc: 'Sedang aktif kuliah' },
            { label: 'Lulus', value: stats.lulus, icon: GraduationCap, bg: 'bg-sky-50', color: 'text-sky-600', desc: 'Telah menyelesaikan studi' },
            { label: 'Cuti', value: stats.cuti, icon: Calendar, bg: 'bg-amber-50', color: 'text-amber-600', desc: 'Sedang dalam masa cuti' },
          ].map(s => (
            <div key={s.label} className="glass-card border border-slate-200/60 rounded-2xl p-5 shadow-none">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', s.bg, s.color)}>
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

        {/* ── Table Card ── */}
        <div className="glass-card border border-slate-200/60 rounded-2xl shadow-none overflow-hidden">
          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1">
              <h2 className="font-black text-sm uppercase tracking-tight font-headline" style={{ color: 'var(--theme-h2)' }}>Daftar Mahasiswa</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Menampilkan <span className="font-bold text-slate-900">{filtered.length}</span> dari <span className="font-bold text-primary">{studentData.length}</span> mahasiswa
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '14px' }} >search</span>
                <input
                  type="text"
                  placeholder="Cari NIM, nama, prodi..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                  className="pl-9 pr-4 h-9 w-56 rounded-xl border border-slate-200/60 focus:outline-none focus:border-primary text-sm bg-white"
                />
              </div>

              {/* Program Studi Filter */}
              <div className="relative">
                <select
                  value={filterProdi}
                  onChange={e => { setFilterProdi(e.target.value); setCurrentPage(1); }}
                  className="h-9 pl-3 pr-8 rounded-xl border border-slate-200/60 text-xs font-medium bg-white text-slate-600 focus:outline-none focus:border-primary appearance-none cursor-pointer max-w-[180px] truncate"
                >
                  <option value="all">Semua Program Studi</option>
                  {prodiList.map(pr => (
                    <option key={pr} value={pr}>{pr}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '16px' }}>expand_more</span>
              </div>

              {/* Semester Filter */}
              <div className="relative">
                <select
                  value={filterSemester}
                  onChange={e => { setFilterSemester(e.target.value); setCurrentPage(1); }}
                  className="h-9 pl-3 pr-8 rounded-xl border border-slate-200/60 text-xs font-medium bg-white text-slate-600 focus:outline-none focus:border-primary appearance-none cursor-pointer"
                >
                  <option value="all">Semua Semester</option>
                  {semesterList.map(sem => (
                    <option key={sem} value={String(sem)}>Semester {sem}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '16px' }}>expand_more</span>
              </div>

              {/* Angkatan Filter */}
              <div className="relative">
                <select
                  value={filterAngkatan}
                  onChange={e => { setFilterAngkatan(e.target.value); setCurrentPage(1); }}
                  className="h-9 pl-3 pr-8 rounded-xl border border-slate-200/60 text-xs font-medium bg-white text-slate-600 focus:outline-none focus:border-primary appearance-none cursor-pointer"
                >
                  <option value="all">Semua Angkatan</option>
                  {angkatanList.map(ang => (
                    <option key={ang} value={String(ang)}>Angkatan {ang}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '16px' }}>expand_more</span>
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                  className="h-9 pl-3 pr-8 rounded-xl border border-slate-200/60 text-xs font-medium bg-white text-slate-600 focus:outline-none focus:border-primary appearance-none cursor-pointer"
                >
                  <option value="all">Semua Status</option>
                  {statusList.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '16px' }}>expand_more</span>
              </div>

              {(search || filterStatus !== 'all' || filterSemester !== 'all' || filterProdi !== 'all' || filterAngkatan !== 'all') && (
                <button
                  onClick={() => {
                    setSearch('')
                    setFilterStatus('all')
                    setFilterSemester('all')
                    setFilterProdi('all')
                    setFilterAngkatan('all')
                    setCurrentPage(1)
                  }}
                  className="h-9 px-3 text-xs font-semibold text-rose-600 bg-rose-50 rounded-xl border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200/60">
                  {[
                    {label: 'No', key: null, sortable: false},
                    { label: 'NIM', key: 'NIM', sortable: true },
                    { label: 'Identitas Mahasiswa', key: 'Nama', sortable: true },
                    { label: 'Program Studi', key: 'ProgramStudi', sortable: true },
                    { label: 'Smt', key: 'SemesterSekarang', sortable: true, className: 'text-center' },
                    { label: 'Status', key: 'StatusAkun', sortable: true },
                    { label: 'Aksi', key: null, sortable: false, className: 'text-center' },
                  ].map(h => (
                    <th
                      key={h.label}
                      onClick={() => h.sortable && handleSort(h.key)}
                      className={cn(
                        'px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider select-none',
                        h.sortable && 'cursor-pointer hover:text-slate-900 group',
                        h.className
                      )}
                    >
                      <div className={cn('flex items-center gap-1.5', h.className?.includes('text-center') ? 'justify-center' : '')}>
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
                {loading ? (
                  Array.from({ length: pageSize }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      {[...Array(7)].map((__, j) => (
                        <td key={j} className="px-5 py-4"><div className="h-4 bg-slate-50 rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-[#eef4ff] rounded-2xl flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined" style={{ fontSize: '22px' }} >group</span>
                        </div>
                        <p className="font-bold text-sm text-slate-900">Tidak Ada Data</p>
                        <p className="text-xs text-slate-400">Coba ubah filter atau kata kunci pencarian.</p>
                      </div>
                    </td>
                  </tr>
                ) : paginated.map((row, i) => {
                  const st = STATUS_STYLES[row.StatusAkun] || STATUS_STYLES['Non-Aktif']
                  return (
                    <tr key={row.ID || i} className="border-b border-[#f5f5f5] hover:bg-[#fafbff] transition-colors">
                      <td className="px-5 py-3.5 text-sm text-slate-400 font-medium">{(currentPage - 1) * pageSize + i + 1}</td>
                      <td className="px-5 py-3.5">
                        <code className="text-[11px] font-bold text-primary tracking-wide bg-[#eff6ff] px-2 py-1 rounded-lg border border-[#dbeafe]">
                          {row.NIM || '—'}
                        </code>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <StudentAvatar src={row.Foto} name={row.Nama} className="w-9 h-9 rounded-xl" />
                          <div>
                            <p className="font-bold text-sm text-slate-900 leading-snug">{row.Nama}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{row.TahunMasuk} · {row.JalurMasuk}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm text-slate-600 font-medium">{row.ProgramStudi}</p>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="text-sm font-black text-slate-900 tabular-nums">
                          {row.SemesterSekarang ?? '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider', st.cls)}>
                          <span className={cn('w-1.5 h-1.5 rounded-full', st.dot)} />
                          {row.StatusAkun}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => setSelected(row)}
                          className="p-1.5 text-slate-400 hover:text-primary hover:bg-[#eef4ff] rounded-lg transition-colors"
                          title="Lihat Detail"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >visibility</span>
                        </button>
                      </td>
                    </tr>
                  )
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

      {/* ── Detail Modal ── */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative w-full max-w-xl glass-card rounded-2xl shadow-none border border-slate-200/60 flex flex-col overflow-hidden max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-bku-primary via-[#00308F] to-[#003db5] pt-6 pb-7 px-6 overflow-hidden flex-shrink-0">
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full pointer-events-none" />
              <div className="absolute -bottom-6 right-16 w-28 h-28 bg-white/5 rounded-full pointer-events-none" />
              <button onClick={() => setSelected(null)}
                className="absolute z-50 top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }} >close</span>
              </button>
              <div className="relative z-10 flex items-center gap-4 mb-5">
                <StudentAvatar src={selected.Foto} name={selected.Nama} className="w-14 h-14 rounded-2xl shadow-xl ring-2 ring-white/20" />
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.25em] mb-1">Profil Mahasiswa</p>
                  <h2 className="text-lg font-extrabold font-headline leading-tight truncate" style={{ color: 'var(--theme-h2)' }}>{selected.Nama}</h2>
                  <p className="text-xs text-blue-200 font-medium mt-0.5">{selected.ProgramStudi}</p>
                </div>
              </div>
              <div className="relative z-10 flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl text-[10px] font-bold text-white font-mono tracking-wider">
                  NIM {selected.NIM}
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl text-[10px] font-bold text-white uppercase tracking-wider">
                  <Award size={10} /> Angkatan {selected.TahunMasuk}
                </span>
                <span className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider',
                  selected.StatusAkun === 'Lulus' ? 'bg-sky-400/20 border border-sky-300/30 text-sky-200' :
                    selected.StatusAkun === 'Cuti' ? 'bg-amber-400/20 border border-amber-300/30 text-amber-200' :
                      'bg-emerald-400/20 border border-emerald-300/30 text-emerald-200'
                )}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  {selected.StatusAkun}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {/* Akademik */}
              <SectionBlock icon={BookOpen} title="Informasi Akademik">
                <InfoCard icon={Building2} label="Program Studi" value={selected.ProgramStudi} accent="border-l-blue-400" />
                <InfoCard icon={Layers} label="Semester" value={selected.SemesterSekarang ? `Semester ${selected.SemesterSekarang}` : '—'} accent="border-l-indigo-400" />
                <InfoCard icon={UserCheck} label="Dosen PA / Wali" value={selected.DosenPA} accent="border-l-violet-400" />
                <InfoCard icon={Award} label="Jalur Masuk" value={selected.JalurMasuk} accent="border-l-amber-400" />
              </SectionBlock>

              {/* Biodata */}
              <SectionBlock icon={FileText} title="Biodata & Kontak">
                <InfoCard icon={Calendar} label="Tempat, Tgl Lahir" value={`${selected.TempatLahir}, ${formatDate(selected.TanggalLahir)}`} accent="border-l-rose-400" />
                <InfoCard icon={Phone} label="No. HP / WhatsApp" value={selected.NoHP} accent="border-l-emerald-400" />
                <InfoCard icon={Mail} label="Email Institusi" value={selected.Email} accent="border-l-sky-400" mono />
                <InfoCard icon={MapPin} label="Alamat" value={selected.Alamat} accent="border-l-slate-400" />
              </SectionBlock>

              {/* Orang Tua */}
              <SectionBlock icon={Heart} title="Data Orang Tua" last>
                <InfoCard icon={Users} label="Nama Ayah" value={selected.NamaAyah} accent="border-l-blue-400" />
                <InfoCard icon={Users} label="Nama Ibu" value={selected.NamaIbu} accent="border-l-pink-400" />
                <InfoCard icon={Award} label="Pekerjaan" value={selected.PekerjaanOrtu} accent="border-l-amber-400" />
                <InfoCard icon={FileText} label="Penghasilan" value={selected.PenghasilanOrtu ? `Rp ${Number(selected.PenghasilanOrtu).toLocaleString('id-ID')}` : '—'} accent="border-l-emerald-400" />
              </SectionBlock>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-slate-200/60 bg-transparent flex gap-3 flex-shrink-0">
              <button onClick={() => setSelected(null)}
                className="flex-1 h-11 rounded-xl border border-slate-200/60 bg-white text-xs font-bold text-slate-600 uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95">
                Tutup
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SectionBlock({ icon, title, children, last = false }) {
  const IconComponent = icon
  return (
    <div className={cn('p-5', !last && 'border-b border-slate-100')}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded-md bg-[#eef4ff] flex items-center justify-center">
          <IconComponent size={11} className="text-primary" />
        </div>
        <h3 className="text-[10px] font-black font-headline uppercase tracking-[0.18em]" style={{ color: 'var(--theme-h3)' }}>{title}</h3>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function InfoCard({ icon, label, value, accent = 'border-l-slate-300', mono = false }) {
  const IconComponent = icon
  const empty = !value || value === '—'
  return (
    <div className={cn('flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 border border-slate-100 border-l-4 hover:bg-white hover:border-slate-200/60 transition-all', accent)}>
      <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm border border-slate-100 flex-shrink-0">
        <IconComponent size={13} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-0.5">{label}</p>
        <p className={cn('text-sm font-semibold text-slate-900 truncate', mono && 'font-mono text-xs', empty && 'text-[#c4c4c4] italic text-xs')}>
          {empty ? 'Belum diisi' : value}
        </p>
      </div>
    </div>
  )
}

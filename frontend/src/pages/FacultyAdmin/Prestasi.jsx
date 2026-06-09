"use client"

import React, { useState, useEffect, useMemo } from "react"

import { toast, Toaster } from "react-hot-toast"
import { cn } from "@/lib/utils"
import { API_BASE_URL } from "../../services/api"
import api from "../../lib/axios"
import useAuthStore from "../../store/useAuthStore"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select"
import { Button } from "@/components/ui/Button"
import { PageContent } from '@/components/ui/page'
import { DashboardHero } from '@/components/ui/dashboard'
import { Badge } from "@/components/ui/Badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog"
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

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
  'from-blue-400 to-indigo-500', 'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500', 'from-rose-400 to-pink-500',
  'from-violet-400 to-purple-500', 'from-cyan-400 to-sky-500',
]
const getInitials = (n = '') => n.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || '?'

const STATUS_STYLES = {
  verified: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Terverifikasi' },
  terverifikasi: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Terverifikasi' },
  diverifikasi: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Terverifikasi' },
  disetujui: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Disetujui' },
  rejected: { cls: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500', label: 'Ditolak' },
  ditolak: { cls: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500', label: 'Ditolak' },
  pending: { cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', label: 'Menunggu' },
}
const getStatus = (val = '') => STATUS_STYLES[val.toLowerCase()] || STATUS_STYLES.pending

const TINGKAT_STYLES = {
  internasional: 'bg-violet-50 text-violet-700 border-violet-200',
  nasional: 'bg-blue-50 text-blue-700 border-blue-200',
  regional: 'bg-cyan-50 text-cyan-700 border-cyan-200',
}

const formatDate = (d) => { try { return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) } catch { return d } }

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
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [filterSemester, setFilterSemester] = useState('all')
  const [filterPeriode, setFilterPeriode] = useState('all')
  const [filterProdi, setFilterProdi] = useState('all')
  const [pageSize, setPageSize] = useState(10)
  const [sortConfig, setSortConfig] = useState({ key: 'CreatedAt', direction: 'desc' })
  const [facultyInfo, setFacultyInfo] = useState(null)

  // Verification dialog states
  const [isVerifyOpen, setIsVerifyOpen] = useState(false)
  const [verifyStatus, setVerifyStatus] = useState("verified")
  const [verifyCatatan, setVerifyCatatan] = useState("")
  const [verifyDanaDisetujui, setVerifyDanaDisetujui] = useState("")
  const [verifyPoin, setVerifyPoin] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      .badge-success { background:#dcfce7; color:#15803d; border:1px solid #bbf7d0; }
      .badge-warning { background:#fef9c3; color:#a16207; border:1px solid #fef08a; }
      .badge-info    { background:#dbeafe; color:#1d4ed8; border:1px solid #bfdbfe; }
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

  const exportAchievementsPDF = () => {
    if (achievements.length === 0) { toast.error('Tidak ada data prestasi untuk diekspor'); return; }
    const dataToExport = filtered.length > 0 && filtered.length < achievements.length ? filtered : achievements;
    let tableRows = '';
    dataToExport.forEach((item, idx) => {
      const stLabel = ['verified', 'terverifikasi', 'disetujui', 'diverifikasi'].includes((item.Status || '').toLowerCase())
        ? '<span class="badge badge-success">Terverifikasi</span>'
        : (item.Status || '').toLowerCase().includes('tolak') || (item.Status || '').toLowerCase() === 'rejected'
          ? '<span class="badge badge-warning">Ditolak</span>'
          : '<span class="badge badge-info">Menunggu</span>';
      const tingkatCls = (item.Tingkat || '').toLowerCase() === 'internasional' ? 'color:#7c3aed;font-weight:700;'
        : (item.Tingkat || '').toLowerCase() === 'nasional' ? 'color:#1d4ed8;font-weight:700;' : 'color:#0e7490;font-weight:700;';
      tableRows += `<tr>
        <td>${idx + 1}</td>
        <td style="font-weight:700;">${item.Mahasiswa?.Nama || '—'}<br/><span style="font-size:7px;color:#64748b;">NIM: ${item.Mahasiswa?.NIM || '—'}</span></td>
        <td>${item.NamaKegiatan || '—'}<br/><span style="font-size:7px;color:#1d4ed8;font-weight:700;">${item.Kategori || 'Umum'}</span></td>
        <td style="${tingkatCls}">${item.Tingkat || 'Lokal'}</td>
        <td>${item.Peringkat || '—'}</td>
        <td style="font-weight:700;text-align:center;">${item.Poin || 0}</td>
        <td>${item.CreatedAt ? new Date(item.CreatedAt).getFullYear() : '—'}</td>
        <td>${stLabel}</td>
      </tr>`;
    });
    const totalVerified = dataToExport.filter(a => ['verified', 'terverifikasi', 'disetujui', 'diverifikasi'].includes((a.Status || '').toLowerCase())).length;
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
      `Dataset Rekapitulasi Kompetisi Dan Penghargaan — ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`,
      contentHtml
    );
    toast.success(`Berhasil mencetak ${dataToExport.length} data prestasi!`);
  };

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

      const res = await api.get('/faculty/prestasi')
      if (res.data.status === 'success')
        setAchievements((res.data.data || []).map((a, i) => ({
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
    setVerifyCatatan(status === "verified" ? (isFunding ? "Pengajuan dana disetujui." : "Prestasi tervalidasi oleh Fakultas.") : "Berkas tidak sesuai kriteria.")
    setVerifyDanaDisetujui(isFunding ? String(row.DanaDiajukan || row.dana_diajukan || 0) : "")
    setVerifyPoin(isFunding ? "" : String(row.Poin || row.poin || 0))
    setIsVerifyOpen(true)
  }

  const handleVerifySubmit = async (e) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch(`${API}/prestasi/${selected.ID || selected.id}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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

  const handleSyncSimkatmawa = async (e, id) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await api.post(`/faculty/achievements/${id}/sync-simkatmawa`)
      if (res.data?.status === 'success') {
        toast.success('Berhasil sinkronisasi dengan SIMKATMAWA! ✅')
        fetchData()
      } else {
        toast.error(res.data?.message || 'Gagal sinkronisasi dengan SIMKATMAWA')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Koneksi gagal saat sinkronisasi')
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
    const st = (a.Status || '').toLowerCase()
    const matchS = filterStatus === 'all' || st === filterStatus || (filterStatus === 'verified' && ['verified', 'terverifikasi', 'disetujui', 'diverifikasi'].includes(st))

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
    total: achievements.length,
    verified: achievements.filter(a => ['verified', 'terverifikasi', 'disetujui', 'diverifikasi'].includes((a.Status || '').toLowerCase())).length,
    pending: achievements.filter(a => !['verified', 'terverifikasi', 'disetujui', 'diverifikasi', 'rejected', 'ditolak'].includes((a.Status || '').toLowerCase())).length,
  }

  const tingkatData = useMemo(() => {
    const counts = {}
    achievements.forEach(a => {
      const t = a.Tingkat || 'Lokal'
      counts[t] = (counts[t] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [achievements])

  const kategoriData = useMemo(() => {
    const counts = {}
    achievements.forEach(a => {
      const k = a.Kategori || 'Umum'
      counts[k] = (counts[k] || 0) + 1
    })
    return Object.entries(counts).sort(([,a],[,b]) => b - a).slice(0, 8).map(([name, value]) => ({ name, value }))
  }, [achievements])

  const monthlyTrendData = useMemo(() => {
    const byMonth = {}
    achievements.forEach(a => {
      const date = a.created_at || a.CreatedAt
      if (!date) return
      const d = new Date(date)
      if (isNaN(d.getTime())) return
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
      byMonth[key] = (byMonth[key] || 0) + 1
    })
    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des']
    return Object.entries(byMonth)
      .sort(([a],[b]) => a.localeCompare(b))
      .map(([m, v]) => {
        const [y, mo] = m.split('-')
        return { month: `${months[parseInt(mo)-1]} ${y}`, value: v }
      })
  }, [achievements])

  const PIE_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']

  return (
    <PageContent>
      <Toaster position="top-right" />

      <DashboardHero
        icon="emoji_events"
        title="Validasi "
        highlightedTitle="Prestasi"
        subtitle="Verifikasi dan validasi capaian mahasiswa dalam kompetisi akademik maupun non-akademik."
        badges={[
          { label: 'Student Achievement', active: false },
          { label: `${stats.total} Pengajuan Masuk`, active: true }
        ]}
        actions={
          <>
            <button onClick={exportAchievementsPDF} disabled={loading || achievements.length === 0}
              className="h-10 px-4 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-sm text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-primary hover:border-primary/30 hover:bg-slate-50/50 shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-50 flex items-center gap-2">
              <Download size={13} className="text-primary" /> Ekspor PDF
            </button>
            <button onClick={fetchData} disabled={loading}
              className="h-10 px-4 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-sm text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-primary hover:border-primary/30 hover:bg-slate-50/50 shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-60 flex items-center gap-2">
              {loading ? <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '13px' }}>sync</span> : <RefreshCw size={13} className="text-primary" />} Refresh Data
            </button>
          </>
        }
      />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Pengajuan', value: stats.total, icon: Trophy, bg: 'bg-[#eef4ff]', color: 'text-primary', desc: 'Prestasi masuk' },
            { label: 'Tervalidasi', value: stats.verified, icon: CheckCircle2, bg: 'bg-emerald-50', color: 'text-emerald-600', desc: 'Sudah diverifikasi' },
            { label: 'Menunggu Review', value: stats.pending, icon: Clock, bg: 'bg-amber-50', color: 'text-amber-600', desc: 'Perlu tindak lanjut' },
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

        {/* Charts */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Pie: Tingkat Prestasi */}
            <div className="bg-white border border-slate-100/50 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>pie_chart</span>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tingkat Prestasi</span>
              </div>
              <div className="h-[180px] w-full flex items-center justify-center">
                {tingkatData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={tingkatData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
                        {tingkatData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", fontSize: "10px", fontWeight: "bold" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <span className="text-xs text-slate-400 italic">Tidak ada data</span>}
              </div>
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {tingkatData.slice(0, 5).map((item, i) => (
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

            {/* Bar: Kategori Terbanyak */}
            <div className="bg-white border border-slate-100/50 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>bar_chart</span>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori Terbanyak</span>
              </div>
              <div className="h-[180px] w-full">
                {kategoriData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={kategoriData} layout="vertical" margin={{ top: 5, right: 20, left: 5, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 8, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} width={70} />
                      <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", fontSize: "10px", fontWeight: "bold" }} />
                      <Bar dataKey="value" name="Jumlah" fill="#10b981" radius={[0, 4, 4, 0]} barSize={14} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="h-full flex items-center justify-center"><span className="text-xs text-slate-400 italic">Tidak ada data</span></div>}
              </div>
            </div>

            {/* Line: Tren Pengajuan */}
            <div className="bg-white border border-slate-100/50 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>trending_up</span>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tren Pengajuan per Bulan</span>
              </div>
              <div className="h-[180px] w-full">
                {monthlyTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 8, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", fontSize: "10px", fontWeight: "bold" }} />
                      <Line type="monotone" dataKey="value" name="Prestasi" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: '#f59e0b', r: 3 }} activeDot={{ r: 5, fill: '#f59e0b' }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : <div className="h-full flex items-center justify-center"><span className="text-xs text-slate-400 italic">Tidak ada data</span></div>}
              </div>
            </div>
          </div>
        )}

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
                {loading ? Array.from({ length: pageSize }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    {[...Array(7)].map((__, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-slate-50 rounded animate-pulse" /></td>)}
                  </tr>
                )) : paginated.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-[#eef4ff] rounded-2xl flex items-center justify-center text-primary"><Trophy size={22} /></div>
                      <p className="font-bold text-sm text-slate-900">Tidak Ada Pengajuan</p>
                      <p className="text-xs text-slate-400">Belum ada mahasiswa yang mengajukan prestasi.</p>
                    </div>
                  </td></tr>
                ) : paginated.map((row, i) => {
                  const st = getStatus(row.Status)
                  const tingkatCls = TINGKAT_STYLES[(row.Tingkat || '').toLowerCase()] || 'bg-slate-50 text-slate-600 border-slate-200'
                  return (
                    <tr key={row.ID || i} className="border-b border-[#f5f5f5] hover:bg-[#fafbff] transition-colors">
                      <td className="px-5 py-3.5 text-sm text-slate-400 font-medium">{(currentPage - 1) * pageSize + i + 1}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <StudentAvatar src={getFullUrl(row.Mahasiswa?.FotoURL || row.Mahasiswa?.foto_url || row.Mahasiswa?.Foto || row.Mahasiswa?.Pengguna?.Foto)} name={row.Mahasiswa?.Nama} className="w-9 h-9 rounded-xl" />
                          <div>
                            <p className="font-bold text-sm text-slate-900 leading-snug">{row.Mahasiswa?.Nama || '—'}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{row.Mahasiswa?.NIM || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-sm text-slate-900 leading-snug max-w-[200px] truncate">{row.NamaKegiatan || '—'}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="inline-block text-[10px] font-bold text-[#00236F] bg-[#eef4ff] px-2 py-0.5 rounded-md">{row.Kategori || 'Umum'}</span>
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${row.Tipe === 'Pengajuan Dana' ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200'}`}>{row.Tipe || 'Laporan Prestasi'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider', tingkatCls)}>
                          {row.Tingkat || 'Lokal'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider whitespace-nowrap', st.cls)}>
                          <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', st.dot)} />{st.label}
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

      {/* Detail Modal */}
      <Dialog open={!!selected && !isVerifyOpen} onOpenChange={(open) => !open && setSelected(null)} maxWidth="max-w-lg">
        <DialogContent className="max-w-lg p-0 overflow-hidden border border-border shadow-2xl rounded-2xl bg-surface animate-in zoom-in-95 duration-200">
          <DialogHeader className="p-8 pb-5 bg-slate-50/50 border-b border-border relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined size-24 rotate-12 text-slate-800">emoji_events</span>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-1.5">
                <div className="size-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>emoji_events</span>
                </div>
                <Badge className="text-[9px] font-black tracking-widest px-2.5 py-0.5 bg-slate-200 text-slate-700 border-none rounded-md">
                  {selected?.Tipe === 'Pengajuan Dana' ? 'DANA LOMBA' : 'PRESTASI MAHASISWA'}
                </Badge>
              </div>
              <DialogTitle className="text-lg md:text-xl font-black font-headline tracking-tighter text-slate-900 line-clamp-2">
                {selected?.NamaKegiatan}
              </DialogTitle>
              <DialogDescription className="text-[11px] font-semibold text-slate-400 mt-0.5">
                {selected?.Mahasiswa?.Nama} · {selected?.Mahasiswa?.NIM}
              </DialogDescription>
            </div>
          </DialogHeader>

          {/* Body */}
          <div className="p-8 pt-5 space-y-5 max-h-[50vh] overflow-y-auto no-scrollbar">
            {selected && (
              <>
                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                  {selected.Kategori && (
                    <span className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      <Award size={10} />
                      {selected.Kategori}
                    </span>
                  )}
                  {selected.Tingkat && (
                    <span className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      <Star size={10} />
                      {selected.Tingkat}
                    </span>
                  )}
                  <span className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border',
                    ['verified', 'terverifikasi', 'disetujui', 'diverifikasi'].includes((selected.Status || '').toLowerCase())
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : (selected.Status || '').toLowerCase().includes('tolak') || (selected.Status || '').toLowerCase() === 'rejected'
                        ? 'bg-rose-50 border-rose-200 text-rose-700'
                        : 'bg-amber-50 border-amber-200 text-amber-700'
                  )}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    {getStatus(selected.Status).label}
                  </span>
                </div>

                {/* Ditolak alert */}
                {((selected.Status || '').toLowerCase().includes('tolak') || (selected.Status || '').toLowerCase() === 'rejected') && (
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
                    <span className="material-symbols-outlined text-rose-600 flex-shrink-0 mt-0.5" style={{ fontSize: '16px' }} >close</span>
                    <div>
                      <p className="font-bold text-rose-700 text-sm">Pengajuan Ditolak</p>
                      <p className="text-rose-600 text-xs mt-0.5">{selected.CatatanVerifikator || 'Berkas tidak sesuai kriteria.'}</p>
                    </div>
                  </div>
                )}

                {/* SIMKATMAWA Info */}
                {selected.SimkatmawaId && (
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                    <span className="material-symbols-outlined text-blue-600 flex-shrink-0 mt-0.5" style={{ fontSize: '16px' }} >cloud_sync</span>
                    <div>
                      <p className="font-bold text-blue-700 text-sm">Disinkronkan ke SIMKATMAWA</p>
                      <p className="text-blue-600 text-xs mt-0.5 mb-2">ID Simkatmawa: {selected.SimkatmawaId}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-blue-700">Status:</span>
                        <select 
                          className="bg-white border border-blue-200 text-blue-700 text-xs font-bold rounded-lg px-2 py-1 outline-none cursor-pointer hover:border-blue-300 transition-colors"
                          value={selected.SimkatmawaStatus || "Sukses"}
                          onChange={async (e) => {
                            const newStatus = e.target.value;
                            try {
                              await api.put(`/faculty/achievements/${selected.ID || selected.id}/simkatmawa-status`, { simkatmawa_status: newStatus });
                              toast.success("Status SIMKATMAWA diperbarui! ✅");
                              fetchData();
                              setSelected({...selected, SimkatmawaStatus: newStatus});
                            } catch(err) {
                              toast.error("Gagal update status");
                            }
                          }}
                        >
                          <option value="Sukses">Sukses Terkirim (Menunggu)</option>
                          <option value="Diterima SIMKATMAWA">Diterima SIMKATMAWA</option>
                          <option value="Ditolak SIMKATMAWA">Ditolak SIMKATMAWA</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Info Grid */}
                <div className="space-y-2">
                  {[
                    { icon: GraduationCap, label: 'Program Studi', value: selected.Mahasiswa?.ProgramStudi?.Nama },
                    { icon: Award, label: 'Kategori', value: selected.Kategori },
                    { icon: Star, label: 'Tingkat', value: selected.Tingkat },
                    selected.Tipe === 'Pengajuan Dana' ? null : { icon: Trophy, label: 'Peringkat', value: selected.Peringkat },
                    { icon: Calendar, label: 'Tanggal', value: formatDate(selected.CreatedAt) },
                    selected.Tipe === 'Pengajuan Dana' ? { icon: CheckCircle2, label: 'Dana Diajukan', value: `Rp ${(selected.DanaDiajukan || 0).toLocaleString('id-ID')}` } : { icon: CheckCircle2, label: 'Poin Didapat', value: selected.Poin != null ? `${selected.Poin} Poin` : '—' },
                    selected.Tipe === 'Pengajuan Dana' && selected.DanaDisetujui > 0 ? { icon: CheckCircle2, label: 'Dana Disetujui', value: `Rp ${selected.DanaDisetujui.toLocaleString('id-ID')}` } : null,
                  ].filter(Boolean).map(r => (
                    <div key={r.label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 border border-slate-100 hover:bg-white transition-all">
                      <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm border border-slate-100 flex-shrink-0">
                        <r.icon size={13} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">{r.label}</p>
                        <p className="text-sm font-semibold text-slate-900 truncate">{r.value || '—'}</p>
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
                    <a href={`${API_BASE_URL.replace('/api', '')}${selected.BuktiURL}`} target="_blank" rel="noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/60 hover:bg-[#eef4ff] hover:border-primary transition-all">
                      <div className="w-9 h-9 bg-[#eef4ff] rounded-xl flex items-center justify-center text-primary flex-shrink-0"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >description</span></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-primary text-sm">
                          {selected.Tipe === 'Pengajuan Dana' ? 'Lihat Proposal / Dokumen' : 'Lihat Dokumen Sertifikat'}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{selected.BuktiURL}</p>
                      </div>
                      <ExternalLink size={14} className="text-primary/40 flex-shrink-0" />
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                      <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-[#c4c4c4] flex-shrink-0"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >description</span></div>
                      <p className="text-sm text-[#c4c4c4] font-medium italic">Belum ada lampiran diunggah.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="flex flex-col md:flex-row items-center justify-end gap-3 p-8 pt-4 border-t border-slate-100 bg-slate-50/30">
            <Button onClick={() => setSelected(null)} variant="ghost"
              className="w-full md:w-auto text-[10px] font-black tracking-widest text-slate-400 hover:text-slate-900 px-8 h-11 rounded-xl active:scale-95 transition-all shadow-none border-none cursor-pointer font-headline uppercase">
              Tutup
            </Button>
            {selected && (selected.Status || '').toLowerCase() === 'menunggu' && (
              <>
                <Button onClick={() => handleOpenVerify(selected, 'rejected')} disabled={isSubmitting} variant="outline"
                  className="w-full md:w-auto h-11 px-8 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 text-[10px] font-black tracking-widest uppercase cursor-pointer">
                  Tolak
                </Button>
                <Button onClick={() => handleOpenVerify(selected, 'verified')} disabled={isSubmitting}
                  className="w-full md:w-auto h-11 px-8 rounded-xl bg-primary hover:bg-primary/95 text-white text-[10px] font-black tracking-widest uppercase cursor-pointer">
                  Validasi
                </Button>
              </>
            )}
            {selected && ['diverifikasi', 'valid', 'disetujui', 'verified'].includes((selected.Status || '').toLowerCase()) && !selected.SimkatmawaId && (
              <Button onClick={(e) => handleSyncSimkatmawa(e, selected.ID || selected.id)} disabled={isSubmitting}
                className="w-full md:w-auto h-11 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black tracking-widest uppercase cursor-pointer flex items-center justify-center gap-2 border-none">
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>sync</span> Kirim ke SIMKATMAWA
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verification Action Dialog */}
      <Dialog open={isVerifyOpen && !!selected} onOpenChange={setIsVerifyOpen} maxWidth="max-w-md">
        <DialogContent className="max-w-md p-0 overflow-hidden border border-border shadow-2xl rounded-2xl bg-surface animate-in zoom-in-95 duration-200">
          <DialogHeader className="p-8 pb-5 bg-slate-50/50 border-b border-border relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined size-24 rotate-12 text-slate-800">
                {verifyStatus === "verified" ? "check_circle" : "cancel"}
              </span>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-1.5">
                <div className={cn("size-8 rounded-xl flex items-center justify-center", 
                  verifyStatus === "verified" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                )}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    {verifyStatus === "verified" ? "check_circle" : "close"}
                  </span>
                </div>
                <Badge className={cn("text-[9px] font-black tracking-widest px-2.5 py-0.5 border-none rounded-md",
                  verifyStatus === "verified" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                )}>
                  {verifyStatus === "verified" ? "APPROVE" : "REJECT"}
                </Badge>
              </div>
              <DialogTitle className="text-lg md:text-xl font-black font-headline tracking-tighter text-slate-900">
                {verifyStatus === "verified" ? "Setujui Pengajuan" : "Tolak Pengajuan"}
              </DialogTitle>
              <DialogDescription className="text-[11px] font-semibold text-slate-400 mt-0.5">
                Tuliskan catatan verifikasi hasil peninjauan berkas mahasiswa.
              </DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleVerifySubmit} className="flex flex-col">
            <div className="p-8 pt-5 space-y-5 max-h-[50vh] overflow-y-auto no-scrollbar">
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] font-semibold text-[var(--theme-text-muted)] tracking-[0.2em] ml-1 uppercase font-headline">Catatan Verifikator</label>
                  <textarea
                    placeholder="Masukkan catatan..."
                    value={verifyCatatan}
                    onChange={(e) => setVerifyCatatan(e.target.value)}
                    className="rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3 text-xs text-[var(--theme-text)] placeholder:text-[var(--theme-text-subtle)] focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:outline-none min-h-[90px] transition-colors resize-none font-semibold"
                    required
                  />
                </div>

                {selected && ((selected.Tipe || selected.tipe) === "Pengajuan Dana" ? (
                  verifyStatus === "verified" && (
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] font-semibold text-[var(--theme-text-muted)] tracking-[0.2em] ml-1 uppercase font-headline">Dana yang Disetujui (Rp)</label>
                      <input
                        type="number"
                        value={verifyDanaDisetujui}
                        onChange={(e) => setVerifyDanaDisetujui(e.target.value)}
                        className="h-10 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] px-3 text-xs text-[var(--theme-text)] placeholder:text-[var(--theme-text-subtle)] focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:outline-none transition-colors font-semibold"
                        placeholder="Cth: 1200000"
                        required
                      />
                    </div>
                  )
                ) : (
                  verifyStatus === "verified" && (
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] font-semibold text-[var(--theme-text-muted)] tracking-[0.2em] ml-1 uppercase font-headline">Poin SKPI Didapat</label>
                      <input
                        type="number"
                        value={verifyPoin}
                        onChange={(e) => setVerifyPoin(e.target.value)}
                        className="h-10 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] px-3 text-xs text-[var(--theme-text)] placeholder:text-[var(--theme-text-subtle)] focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:outline-none transition-colors font-semibold"
                        required
                      />
                    </div>
                  )
                ))}
              </div>
            </div>

            <DialogFooter className="flex flex-col md:flex-row items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsVerifyOpen(false)}
                className="w-full md:w-auto text-xs font-semibold px-6 h-10 rounded-xl active:scale-95 transition-all text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] border-none cursor-pointer uppercase tracking-wider"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className={cn("w-full md:w-auto h-10 px-6 rounded-xl text-white transition-all active:scale-95 flex items-center justify-center gap-2 border-none cursor-pointer text-xs font-semibold uppercase",
                  verifyStatus === "verified" ? "bg-[var(--theme-success)] hover:bg-[var(--theme-success)]/90" : "bg-[var(--theme-error)] hover:bg-[var(--theme-error)]/90"
                )}
              >
                {isSubmitting ? (
                  <span className="material-symbols-outlined animate-spin size-4" style={{ fontSize: '15px' }}>sync</span>
                ) : (
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>save</span>
                )}
                <span>
                  {verifyStatus === "verified" ? "Validasi" : "Tolak"}
                </span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContent>
  )
}

"use client"

import React, { useState, useEffect, useMemo } from 'react'
import api from '../../lib/axios'
import { API_BASE_URL } from '../../services/api'
import { toast, Toaster } from 'react-hot-toast'
import useAuthStore from '../../store/useAuthStore'

import { cn } from '@/lib/utils'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select"
import { Button } from "@/components/ui/Button"

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Droplet = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>opacity</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const HeartPulse = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>monitor_heart</span>;
const AlertCircle = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>error</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Activity = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>show_chart</span>;
const Calendar = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>calendar_today</span>;
const GraduationCap = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>school</span>;
const ShieldCheck = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>verified_user</span>;



const AVATAR_COLORS = [
  'from-blue-400 to-indigo-500', 'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500', 'from-rose-400 to-pink-500',
  'from-violet-400 to-purple-500', 'from-cyan-400 to-sky-500',
]
const getInitials = (n = '') => n.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || '?'

const HEALTH_STATUS = {
  prima: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  stabil: { cls: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  pantauan: { cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  kritis: { cls: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
}
const getHealth = (v = '') => HEALTH_STATUS[(v || 'stabil').toLowerCase()] || HEALTH_STATUS.stabil

const formatDate = (d) => { try { return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) } catch { return d } }

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

export default function FacultyKesehatan() {
  const [loading, setLoading] = useState(true)
  const [healthRecords, setHealthRecords] = useState([])
  const [statsData, setStatsData] = useState({ total: 0, condition: { prima: 0, stabil: 0, pantauan: 0, kritis: 0 } })
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterProdi, setFilterProdi] = useState('all')
  const [filterBlood, setFilterBlood] = useState('all')
  const [filterJenis, setFilterJenis] = useState('all')
  const [facultyInfo, setFacultyInfo] = useState(null)

  const [statsDetail, setStatsDetail] = useState(null)
  const [statsSearch, setStatsSearch] = useState('')

  const uniqueProdis = useMemo(() => {
    const prodis = new Set();
    healthRecords.forEach(r => {
      if (r.Mahasiswa?.ProgramStudi?.Nama) {
        prodis.add(r.Mahasiswa.ProgramStudi.Nama);
      }
    });
    return Array.from(prodis);
  }, [healthRecords]);

  const uniqueJenis = useMemo(() => {
    const js = new Set();
    healthRecords.forEach(r => {
      if (r.JenisPemeriksaan) {
        js.add(r.JenisPemeriksaan);
      }
    });
    return Array.from(js);
  }, [healthRecords]);

  const handleOpenStatsDetail = (key, label) => {
    let list = []
    if (key === 'total') {
      list = healthRecords
    } else {
      list = healthRecords.filter(r => (r.StatusKesehatan || '').toLowerCase() === key)
    }
    setStatsDetail({ label, key, list })
    setStatsSearch('')
  }

  const filteredStatsDetailList = useMemo(() => {
    if (!statsDetail) return []
    const q = statsSearch.toLowerCase()
    return statsDetail.list.filter(r =>
      !q || r.Mahasiswa?.Nama?.toLowerCase().includes(q) || r.Mahasiswa?.NIM?.includes(q) || r.Mahasiswa?.ProgramStudi?.Nama?.toLowerCase().includes(q)
    )
  }, [statsDetail, statsSearch])

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortConfig, setSortConfig] = useState({ key: 'Tanggal', direction: 'desc' })

  const getKopImage = (facName) => {
    const name = (facName || "").toLowerCase();
    if (name.includes("farmasi")) return "kop_farmasi.jpg";
    if (name.includes("kesehatan") || name.includes("fikes")) return "kop_ilmu_kesehatan.jpg";
    if (name.includes("keperawatan") || name.includes("fkep")) return "kop_keperawatan.jpg";
    if (name.includes("sosial") || name.includes("social") || name.includes("sosiologi") || name.includes("fis")) return "kop_ilmu_sosial.jpg";
    return "kop_farmasi.jpg";
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

      const [progRes, summaryRes] = await Promise.all([
        api.get('/faculty/health-screening'),
        api.get('/faculty/health-screening/summary')
      ])
      if (progRes.data.status === 'success') {
        const normalized = (progRes.data.data || []).map((r, i) => ({
          ...r,
          Mahasiswa: r.mahasiswa,
          GolonganDarah: r.golongan_darah,
          StatusKesehatan: r.status_kesehatan,
          Tanggal: r.tanggal,
          TinggiBadan: r.tinggi_badan,
          BeratBadan: r.berat_badan,
          Sistole: r.sistole,
          Diastole: r.diastole,
          GulaDarah: r.gula_darah,
          ButaWarna: r.buta_warna,
          RiwayatPenyakit: r.riwayat_penyakit,
          FileURL: r.file_url,
          JenisPemeriksaan: r.jenis_pemeriksaan,
          Hasil: r.hasil,
          Catatan: r.catatan,
          colorIdx: i % AVATAR_COLORS.length
        }))
        setHealthRecords(normalized)
      }
      if (summaryRes.data.status === 'success')
        setStatsData(summaryRes.data.data || { total: 0, condition: { prima: 0, stabil: 0, pantauan: 0, kritis: 0 } })
    } catch { toast.error('Gagal sinkronisasi data kesehatan') }
    finally { setLoading(false) }
  }

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
      .badge-prima    { background:#dcfce7; color:#15803d; border:1px solid #bbf7d0; }
      .badge-stabil   { background:#dbeafe; color:#1d4ed8; border:1px solid #bfdbfe; }
      .badge-pantauan { background:#fef9c3; color:#a16207; border:1px solid #fef08a; }
      .badge-kritis   { background:#fee2e2; color:#b91c1c; border:1px solid #fecaca; }
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

  const exportHealthPDF = () => {
    if (healthRecords.length === 0) { toast.error('Tidak ada data kesehatan untuk diekspor'); return; }
    const dataToExport = filtered.length > 0 && filtered.length < healthRecords.length ? filtered : healthRecords;
    const calcBMI = (r) => {
      if (!r.TinggiBadan || r.TinggiBadan <= 0) return '—';
      return (r.BeratBadan / Math.pow(r.TinggiBadan / 100, 2)).toFixed(1);
    };
    const healthBadge = (s) => `<span class="badge badge-${(s || 'stabil').toLowerCase()}">${s || 'Stabil'}</span>`;
    let rows = '';
    dataToExport.forEach((r, i) => {
      const bmiVal = calcBMI(r);
      rows += `<tr>
        <td>${i + 1}</td>
        <td style="font-weight:700;">${r.Mahasiswa?.Nama || '—'}<br/><span style="font-size:7px;color:#64748b;">NIM: ${r.Mahasiswa?.NIM || '—'}</span></td>
        <td>${r.Mahasiswa?.ProgramStudi?.Nama || '—'}</td>
        <td style="text-align:center;font-weight:700;color:#dc2626;">${r.GolonganDarah || '?'}</td>
        <td style="text-align:center;">${r.TinggiBadan ? parseFloat(r.TinggiBadan).toFixed(1) + ' cm' : '—'}</td>
        <td style="text-align:center;">${r.BeratBadan ? parseFloat(r.BeratBadan).toFixed(1) + ' kg' : '—'}</td>
        <td style="text-align:center;${bmiVal !== '—' && parseFloat(bmiVal) >= 25 ? 'color:#dc2626;font-weight:700;' : ''}">${bmiVal}</td>
        <td style="text-align:center;">${(r.Sistole || r.Diastole) ? r.Sistole + '/' + r.Diastole + ' mmHg' : '—'}</td>
        <td>${healthBadge(r.StatusKesehatan)}</td>
        <td>${r.Tanggal ? new Date(r.Tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
      </tr>`;
    });
    const prima = dataToExport.filter(r => (r.StatusKesehatan || '').toLowerCase() === 'prima').length;
    const pantauan = dataToExport.filter(r => (r.StatusKesehatan || '').toLowerCase() === 'pantauan').length;
    const content = `<table style="width:100%;border-collapse:collapse;border:none;margin-bottom:16px;"><tr>
      <td style="padding:0 5px 0 0;width:33%;"><div style="background:#f8fafc;border:1px solid #e2e8f0;padding:10px 12px;border-radius:5px;">
        <div style="font-size:7px;font-weight:700;color:#64748b;text-transform:uppercase;">Total Rekam Medis</div>
        <div style="font-size:14px;font-weight:700;color:#00236F;">${dataToExport.length} Data</div>
      </div></td>
      <td style="padding:0 5px;width:33%;"><div style="background:#f8fafc;border:1px solid #e2e8f0;padding:10px 12px;border-radius:5px;">
        <div style="font-size:7px;font-weight:700;color:#64748b;text-transform:uppercase;">Kondisi Prima</div>
        <div style="font-size:14px;font-weight:700;color:#15803d;">${prima} Orang</div>
      </div></td>
      <td style="padding:0 0 0 5px;width:34%;"><div style="background:#f8fafc;border:1px solid #e2e8f0;padding:10px 12px;border-radius:5px;">
        <div style="font-size:7px;font-weight:700;color:#64748b;text-transform:uppercase;">Dalam Pantauan</div>
        <div style="font-size:14px;font-weight:700;color:#d97706;">${pantauan} Orang</div>
      </div></td>
    </tr></table>
    <table class="data-table"><thead><tr>
      <th style="width:4%;">No</th>
      <th style="width:20%;">Mahasiswa</th>
      <th style="width:18%;">Program Studi</th>
      <th style="width:6%;text-align:center;">Gol. Darah</th>
      <th style="width:8%;text-align:center;">Tinggi</th>
      <th style="width:7%;text-align:center;">Berat</th>
      <th style="width:6%;text-align:center;">BMI</th>
      <th style="width:12%;text-align:center;">Tekanan Darah</th>
      <th style="width:9%;">Status</th>
      <th style="width:10%;">Tgl Periksa</th>
    </tr></thead><tbody>${rows}</tbody></table>`;
    downloadPDF(
      'Rekap Skrining Kesehatan Mahasiswa Fakultas',
      `Laporan Monitoring Rekam Medis — ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`,
      content
    );
    toast.success(`Berhasil mencetak ${dataToExport.length} data rekam medis!`);
  };

  useEffect(() => { fetchData() }, [])

  const filtered = useMemo(() => healthRecords.filter(r => {
    const q = search.toLowerCase()
    const matchQ = !q || r.Mahasiswa?.Nama?.toLowerCase().includes(q) || r.Mahasiswa?.NIM?.includes(q)
    const matchS = filterStatus === 'all' || (r.StatusKesehatan || '').toLowerCase() === filterStatus
    const matchProdi = filterProdi === 'all' || r.Mahasiswa?.ProgramStudi?.Nama === filterProdi
    const matchBlood = filterBlood === 'all' || (r.GolonganDarah || '').toUpperCase() === filterBlood.toUpperCase()
    const matchJenis = filterJenis === 'all' || r.JenisPemeriksaan === filterJenis
    return matchQ && matchS && matchProdi && matchBlood && matchJenis
  }), [healthRecords, search, filterStatus, filterProdi, filterBlood, filterJenis])

  const sorted = useMemo(() => {
    let items = [...filtered]
    if (sortConfig.key !== null) {
      items.sort((a, b) => {
        let aVal = a[sortConfig.key]
        let bVal = b[sortConfig.key]

        if (sortConfig.key === 'Mahasiswa.Nama') {
          aVal = a.Mahasiswa?.Nama || ''
          bVal = b.Mahasiswa?.Nama || ''
        } else if (sortConfig.key === 'Mahasiswa.ProgramStudi.Nama') {
          aVal = a.Mahasiswa?.ProgramStudi?.Nama || ''
          bVal = b.Mahasiswa?.ProgramStudi?.Nama || ''
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

  const bmi = (r) => {
    if (!r.TinggiBadan || r.TinggiBadan <= 0) return null
    return (r.BeratBadan / Math.pow(r.TinggiBadan / 100, 2)).toFixed(1)
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
                  <span className="material-symbols-outlined text-primary relative z-10 transition-transform duration-300 group-hover/icon:scale-110" style={{ fontSize: '26px' }}>monitor_heart</span>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-primary/5 text-primary border border-primary/10">
                      Medical Monitoring System
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {statsData.condition?.pantauan || 0} Mahasiswa Pantauan
                    </span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-headline leading-none">
                    Pantau <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Kesehatan</span>
                  </h1>
                </div>
              </div>

              {/* Perfectly aligned description block */}
              <p className="text-slate-500 font-medium text-xs md:text-sm max-w-3xl leading-relaxed mt-3 pl-0 md:pl-[72px]">
                Monitoring kesehatan dan hasil skrining medis mahasiswa di lingkungan fakultas secara real-time.
              </p>
            </div>

            {/* Action and quick count balance box */}
            <div className="flex flex-row lg:flex-col items-end gap-3 shrink-0 self-stretch lg:self-auto justify-between lg:justify-center border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
              <div className="hidden lg:flex items-center gap-2 text-right">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Skrining</span>
                <span className="text-sm font-extrabold text-primary px-2 py-0.5 rounded-md bg-[#eef4ff] border border-blue-100">{statsData.total}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={exportHealthPDF} disabled={loading || healthRecords.length === 0}
                  className="h-10 px-4 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-sm text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-primary hover:border-primary/30 hover:bg-slate-50/50 shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-50 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: 13 }}>download</span> Ekspor PDF
                </button>
                <button onClick={fetchData} disabled={loading}
                  className="h-10 px-4 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-sm text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-primary hover:border-primary/30 hover:bg-slate-50/50 shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-60 flex items-center gap-2">
                  {loading ? <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '13px' }} >sync</span> : <span className="material-symbols-outlined text-primary" style={{ fontSize: 13 }}>sync</span>} Refresh Data
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { key: 'total', label: 'Total Skrining', value: statsData.total, icon: Activity, bg: 'bg-[#eef4ff]', color: 'text-primary', desc: 'Semua rekam medis' },
            { key: 'prima', label: 'Kondisi Prima', value: statsData.condition?.prima || 0, icon: HeartPulse, bg: 'bg-emerald-50', color: 'text-emerald-600', desc: 'Status sangat sehat' },
            { key: 'stabil', label: 'Status Stabil', value: statsData.condition?.stabil || 0, icon: ShieldCheck, bg: 'bg-blue-50', color: 'text-blue-600', desc: 'Kondisi normal' },
            { key: 'pantauan', label: 'Dalam Pantauan', value: statsData.condition?.pantauan || 0, icon: AlertCircle, bg: 'bg-amber-50', color: 'text-amber-600', desc: 'Butuh pemantauan' },
            { key: 'kritis', label: 'Kondisi Kritis', value: statsData.condition?.kritis || 0, icon: AlertCircle, bg: 'bg-rose-50', color: 'text-rose-600', desc: 'Penanganan segera' },
          ].map(s => (
            <div
              key={s.label}
              onClick={() => handleOpenStatsDetail(s.key, s.label)}
              className="bg-white border border-slate-100/50 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-slate-200 cursor-pointer transition-all hover:scale-[1.01] duration-200 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110', s.bg, s.color)}>
                      <s.icon size={18} />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
                  </div>
                  <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors" style={{ fontSize: '16px' }}>arrow_forward</span>
                </div>
                <p className="text-2xl font-extrabold text-slate-900 leading-none tabular-nums">
                  {loading ? (
                    <span className="material-symbols-outlined animate-spin text-slate-300" style={{ fontSize: '18px' }} >sync</span>
                  ) : (
                    s.value
                  )}
                </p>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-3">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="glass-card border border-slate-200/60 rounded-2xl shadow-none overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1">
              <h2 className="font-black text-sm uppercase tracking-tight font-headline" style={{ color: 'var(--theme-h2)' }}>Rekam Medis Mahasiswa</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Menampilkan <span className="font-bold text-slate-900">{filtered.length}</span> dari <span className="font-bold text-primary">{healthRecords.length}</span> data
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '14px' }} >search</span>
                <input type="text" placeholder="Cari nama atau NIM..." value={search} onChange={e => setSearch(e.target.value)}
                  className="pl-9 pr-4 h-9 w-44 rounded-xl border border-slate-200/60 focus:outline-none focus:border-primary text-sm bg-white" />
              </div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="h-9 pl-3 pr-8 rounded-xl border border-slate-200/60 text-xs font-medium bg-white text-slate-600 focus:outline-none focus:border-primary appearance-none cursor-pointer">
                <option value="all">Semua Status</option>
                <option value="prima">Prima</option>
                <option value="stabil">Stabil</option>
                <option value="pantauan">Pantauan</option>
                <option value="kritis">Kritis</option>
              </select>
              <select value={filterProdi} onChange={e => setFilterProdi(e.target.value)}
                className="h-9 pl-3 pr-8 rounded-xl border border-slate-200/60 text-xs font-medium bg-white text-slate-600 focus:outline-none focus:border-primary appearance-none cursor-pointer max-w-[150px]">
                <option value="all">Semua Prodi</option>
                {uniqueProdis.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select value={filterBlood} onChange={e => setFilterBlood(e.target.value)}
                className="h-9 pl-3 pr-8 rounded-xl border border-slate-200/60 text-xs font-medium bg-white text-slate-600 focus:outline-none focus:border-primary appearance-none cursor-pointer">
                <option value="all">Semua Gol. Darah</option>
                <option value="A">Gol. Darah A</option>
                <option value="B">Gol. Darah B</option>
                <option value="AB">Gol. Darah AB</option>
                <option value="O">Gol. Darah O</option>
              </select>
              <select value={filterJenis} onChange={e => setFilterJenis(e.target.value)}
                className="h-9 pl-3 pr-8 rounded-xl border border-slate-200/60 text-xs font-medium bg-white text-slate-600 focus:outline-none focus:border-primary appearance-none cursor-pointer max-w-[150px]">
                <option value="all">Semua Jenis Periksa</option>
                {uniqueJenis.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
              {(search || filterStatus !== 'all' || filterProdi !== 'all' || filterBlood !== 'all' || filterJenis !== 'all') && (
                <button onClick={() => { setSearch(''); setFilterStatus('all'); setFilterProdi('all'); setFilterBlood('all'); setFilterJenis('all'); }}
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
                    { label: 'Mahasiswa', key: 'Mahasiswa.Nama', sortable: true },
                    { label: 'Program Studi', key: 'Mahasiswa.ProgramStudi.Nama', sortable: true },
                    { label: 'Gol. Darah', key: 'GolonganDarah', sortable: true },
                    { label: 'Status Kesehatan', key: 'StatusKesehatan', sortable: true },
                    { label: 'Tgl Periksa', key: 'Tanggal', sortable: true },
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
                      <div className="w-12 h-12 bg-[#eef4ff] rounded-2xl flex items-center justify-center text-primary"><HeartPulse size={22} /></div>
                      <p className="font-bold text-sm text-slate-900">Tidak Ada Data Kesehatan</p>
                      <p className="text-xs text-slate-400">Belum ada rekam medis tersimpan.</p>
                    </div>
                  </td></tr>
                ) : paginated.map((row, i) => {
                  const hs = getHealth(row.StatusKesehatan)
                  return (
                    <tr key={row.ID || i} className="border-b border-[#f5f5f5] hover:bg-[#fafbff] transition-colors">
                      <td className="px-5 py-3.5 text-sm text-slate-400 font-medium">{(currentPage - 1) * pageSize + i + 1}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <StudentAvatar src={getFullUrl(row.Mahasiswa?.FotoURL || row.Mahasiswa?.foto_url)} name={row.Mahasiswa?.Nama} className="w-9 h-9 rounded-xl" />
                          <div>
                            <p className="font-bold text-sm text-slate-900">{row.Mahasiswa?.Nama || '—'}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{row.Mahasiswa?.NIM || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-600 font-medium">{row.Mahasiswa?.ProgramStudi?.Nama || '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-black">
                          {row.GolonganDarah || '?'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider whitespace-nowrap', hs.cls)}>
                          <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', hs.dot)} />{row.StatusKesehatan || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500 font-medium whitespace-nowrap">{formatDate(row.Tanggal)}</td>
                      <td className="px-5 py-3.5">
                        <button onClick={() => setSelected(row)}
                          className="p-1.5 text-slate-400 hover:text-primary hover:bg-[#eef4ff] rounded-lg transition-colors" title="Detail">
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }} >visibility</span>
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

      {/* Stats Detail Modal (Pop-up rincian dari card stats) */}
      {statsDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setStatsDetail(null)}>
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl z-[101] flex flex-col overflow-hidden max-h-[85vh]"
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="bg-gradient-to-br from-[#00236F] via-[#00308F] to-[#003db5] pt-6 pb-5 px-6 relative flex-shrink-0">
              <button onClick={() => setStatsDetail(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors text-white">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >close</span>
              </button>
              <h3 className="text-lg font-extrabold text-white tracking-tight leading-tight">{statsDetail.label}</h3>
              <p className="text-xs text-blue-200 mt-1">Daftar mahasiswa baru dengan status kesehatan tersebut</p>
            </div>

            {/* Toolbar */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
              <div className="relative w-full sm:w-72">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '15px' }} >search</span>
                <input
                  type="text"
                  placeholder="Cari nama, NIM, prodi..."
                  value={statsSearch}
                  onChange={e => setStatsSearch(e.target.value)}
                  className="pl-9 pr-4 h-9 w-full rounded-xl border border-slate-200/60 focus:outline-none focus:border-primary text-xs bg-white"
                />
              </div>
              <p className="text-xs text-slate-500 font-semibold">
                Menampilkan <span className="text-primary">{filteredStatsDetailList.length}</span> data
              </p>
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredStatsDetailList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-2"><HeartPulse size={20} /></div>
                  <p className="font-bold text-sm text-slate-800">Tidak ada mahasiswa ditemukan</p>
                  <p className="text-xs text-slate-400">Kata kunci tidak cocok dengan data mana pun.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredStatsDetailList.map((row) => {
                    const hs = getHealth(row.StatusKesehatan)
                    return (
                      <div key={row.ID} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-white hover:border-primary/20 hover:shadow-sm transition-all group">
                        <StudentAvatar src={getFullUrl(row.Mahasiswa?.FotoURL || row.Mahasiswa?.foto_url)} name={row.Mahasiswa?.Nama} className="w-11 h-11 rounded-xl" />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-slate-900 group-hover:text-primary transition-colors truncate">{row.Mahasiswa?.Nama || '—'}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{row.Mahasiswa?.NIM || '—'} · {row.Mahasiswa?.ProgramStudi?.Nama || '—'}</p>
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-md bg-rose-50 border border-rose-100 text-rose-600 text-[9px] font-black font-mono">
                              Gol. {row.GolonganDarah || '?'}
                            </span>
                            <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold border uppercase tracking-wider whitespace-nowrap', hs.cls)}>
                              <span className={cn('w-1 h-1 rounded-full shrink-0', hs.dot)} />{row.StatusKesehatan || '—'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => { setSelected(row); setStatsDetail(null); }}
                          className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-[#eef4ff] text-slate-400 hover:text-primary flex items-center justify-center transition-colors shadow-inner"
                          title="Detail Rekam Medis"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>visibility</span>
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end flex-shrink-0">
              <button onClick={() => setStatsDetail(null)}
                className="h-10 px-6 rounded-xl bg-primary hover:bg-[#001a52] text-white text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-[#00236F]/20">
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setSelected(null)}>
          <div className="relative w-full max-w-lg glass-card rounded-2xl shadow-none border border-slate-200/60 flex flex-col overflow-hidden max-h-[90vh]"
            onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="relative bg-gradient-to-br from-bku-primary via-[#00308F] to-[#003db5] pt-6 pb-7 px-6 overflow-hidden flex-shrink-0">
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full pointer-events-none" />
              <button onClick={() => setSelected(null)}
                className="absolute z-50 top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }} >close</span>
              </button>
              <div className="relative z-10 flex items-center gap-4 mb-5">
                <StudentAvatar src={getFullUrl(selected.Mahasiswa?.FotoURL || selected.Mahasiswa?.foto_url)} name={selected.Mahasiswa?.Nama} className="w-14 h-14 rounded-2xl shadow-xl ring-2 ring-white/20" />
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.25em] mb-1">Rekam Medis Mahasiswa</p>
                  <h2 className="text-base font-extrabold font-headline leading-tight text-white">{selected.Mahasiswa?.Nama}</h2>
                  <p className="text-xs text-blue-200 font-medium mt-0.5">{selected.Mahasiswa?.NIM} · {selected.Mahasiswa?.ProgramStudi?.Nama || '—'}</p>
                </div>
              </div>
              <div className="relative z-10 flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl text-[10px] font-bold text-white font-mono tracking-wider">
                  <Droplet size={10} /> Gol. {selected.GolonganDarah || '?'}
                </span>
                <span className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider',
                  selected.StatusKesehatan === 'prima' ? 'bg-emerald-400/20 border border-emerald-300/30 text-emerald-200'
                    : selected.StatusKesehatan === 'stabil' ? 'bg-blue-400/20 border border-blue-300/30 text-blue-200'
                      : selected.StatusKesehatan === 'pantauan' ? 'bg-amber-400/20 border border-amber-300/30 text-amber-200'
                        : 'bg-rose-400/20 border border-rose-300/30 text-rose-200')}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  {selected.StatusKesehatan || 'Stabil'}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Data Fisik Grid */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-md bg-[#eef4ff] flex items-center justify-center"><span className="material-symbols-outlined text-primary" style={{ fontSize: '11px' }} >show_chart</span></div>
                  <h3 className="text-[10px] font-black font-headline uppercase tracking-[0.18em]" style={{ color: 'var(--theme-h3)' }}>Data Fisik & Vital</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Tinggi Badan', value: selected.TinggiBadan ? `${parseFloat(selected.TinggiBadan).toFixed(1)} cm` : '—' },
                    { label: 'Berat Badan', value: selected.BeratBadan ? `${parseFloat(selected.BeratBadan).toFixed(1)} kg` : '—' },
                    { label: 'BMI', value: bmi(selected) || '—', highlight: bmi(selected) >= 25 },
                    { label: 'Tekanan Darah', value: (selected.Sistole || selected.Diastole) ? `${selected.Sistole || 0}/${selected.Diastole || 0} mmHg` : '—' },
                    { label: 'Gula Darah', value: selected.GulaDarah ? `${selected.GulaDarah} mg/dL` : '—' },
                    { label: 'Buta Warna', value: selected.ButaWarna || '—' },
                    { label: 'Jenis Pemeriksaan', value: selected.JenisPemeriksaan || '—' },
                    { label: 'Hasil Medis', value: selected.Hasil || '—' },
                  ].map(item => (
                    <div key={item.label} className="bg-slate-50/50 border border-slate-100 rounded-xl p-3">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">{item.label}</p>
                      <p className={cn('text-sm font-extrabold', item.highlight ? 'text-rose-600' : 'text-slate-900')}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Riwayat Penyakit */}
              {selected.RiwayatPenyakit && (
                <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-1.5">Riwayat Penyakit</p>
                  <p className="text-xs text-slate-700 leading-relaxed">{selected.RiwayatPenyakit}</p>
                </div>
              )}

              {/* Catatan */}
              {selected.Catatan && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <p className="text-[10px] font-black text-amber-700 uppercase tracking-[0.18em] mb-1.5">Catatan Medis</p>
                  <p className="text-xs text-amber-800 leading-relaxed">{selected.Catatan}</p>
                </div>
              )}

              {/* File Dokumen / Lampiran */}
              {selected.FileURL && (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black text-blue-700 uppercase tracking-[0.18em] mb-0.5">Berkas Hasil Medis</p>
                    <p className="text-[10px] text-blue-500 font-medium truncate">Dokumen hasil pemeriksaan resmi (.pdf/.jpg)</p>
                  </div>
                  <a href={getFullUrl(selected.FileURL)} target="_blank" rel="noreferrer"
                    className="h-8 px-3 rounded-lg bg-primary hover:bg-[#001a52] text-white text-xs font-bold uppercase tracking-widest flex items-center gap-1 transition-all shadow-sm shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>visibility</span> Lihat
                  </a>
                </div>
              )}

              {/* Info Tambahan */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-md bg-[#eef4ff] flex items-center justify-center"><span className="material-symbols-outlined text-primary" style={{ fontSize: '11px' }} >calendar_month</span></div>
                  <h3 className="text-[10px] font-black font-headline uppercase tracking-[0.18em]" style={{ color: 'var(--theme-h3)' }}>Informasi Tambahan</h3>
                </div>
                <div className="space-y-1">
                  {[
                    { icon: Calendar, label: 'Tanggal Periksa', value: formatDate(selected.Tanggal) },
                    { icon: GraduationCap, label: 'Program Studi', value: selected.Mahasiswa?.ProgramStudi?.Nama },
                    { icon: ShieldCheck, label: 'Status', value: selected.StatusKesehatan || 'Stabil' },
                  ].map(r => (
                    <div key={r.label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 border border-slate-100 hover:bg-white transition-all">
                      <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm border border-slate-100 flex-shrink-0">
                        <r.icon size={13} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">{r.label}</p>
                        <p className="text-sm font-semibold text-slate-900">{r.value || '—'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-slate-200/60 bg-transparent flex gap-3 flex-shrink-0">
              <button onClick={() => window.print()}
                className="flex-1 h-11 rounded-xl border border-slate-200/60 bg-white text-xs font-bold text-slate-600 uppercase tracking-widest hover:bg-slate-50 transition-all">
                Cetak
              </button>
              <button onClick={() => setSelected(null)}
                className="flex-1 h-11 rounded-xl bg-primary hover:bg-bku-hover text-white text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-bku-primary/20">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
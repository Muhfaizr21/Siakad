"use client"

import React, { useState, useEffect, useMemo } from "react"
import api from "../../lib/axios"
import { pddiktiService, API_BASE_URL } from "../../services/api"
import useAuthStore from "../../store/useAuthStore"
import { toast, Toaster } from "react-hot-toast"
import { cn } from "@/lib/utils"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select"
import { Button } from "@/components/ui/Button"
import { PageContent } from "@/components/ui/page/PageContent"
import { DashboardHero } from "@/components/ui/dashboard/DashboardHero"
import { DialogModal, ModalCancelButton } from "@/components/ui/DialogModal"
import { PrimaryStatsCard } from "@/components/ui/StatsCard"
import DataTable from "@/components/ui/DataTable"

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
  'Aktif': { cls: 'bg-[var(--theme-success-light)] text-[var(--theme-success)] border-[var(--theme-success)]/10', dot: 'bg-[var(--theme-success)]' },
  'active': { cls: 'bg-[var(--theme-success-light)] text-[var(--theme-success)] border-[var(--theme-success)]/10', dot: 'bg-[var(--theme-success)]' },
  'Lulus': { cls: 'bg-[var(--theme-info-light)] text-[var(--theme-info)] border-[var(--theme-info)]/10', dot: 'bg-[var(--theme-info)]' },
  'Cuti': { cls: 'bg-[var(--theme-warning-light)] text-[var(--theme-warning)] border-[var(--theme-warning)]/10', dot: 'bg-[var(--theme-warning)]' },
  'leave': { cls: 'bg-[var(--theme-warning-light)] text-[var(--theme-warning)] border-[var(--theme-warning)]/10', dot: 'bg-[var(--theme-warning)]' },
  'Non-Aktif': { cls: 'bg-[var(--theme-error-light)] text-[var(--theme-error)] border-[var(--theme-error)]/10', dot: 'bg-[var(--theme-error)]' },
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
  const [facultyInfo, setFacultyInfo] = useState(null)
  const [filterPeriod, setFilterPeriod] = useState('all')

  const getKopImage = (facName) => {
    const name = (facName || "").toLowerCase();
    if (name.includes("farmasi")) return "kop_farmasi.jpg";
    if (name.includes("kesehatan") || name.includes("fikes")) return "kop_ilmu_kesehatan.jpg";
    if (name.includes("keperawatan") || name.includes("fkep")) return "kop_keperawatan.jpg";
    if (name.includes("sosial") || name.includes("social") || name.includes("sosiologi") || name.includes("fis")) return "kop_ilmu_sosial.jpg";
    return "kop_farmasi.jpg";
  };

  const fetchStudents = React.useCallback(async () => {
    Promise.resolve().then(() => setLoading(true))
    try {
      try {
        const profileRes = await api.get('/faculty/profile')
        if (profileRes.data?.success && profileRes.data?.data?.fakultas) {
          setFacultyInfo(profileRes.data.data.fakultas)
        }
      } catch (err) {
        console.error("Failed to fetch faculty profile", err)
      }

      const res = await api.get('/faculty/students')
      setStudentData((res?.data?.data || []).map(mapStudent))
    } catch { toast.error("Gagal memuat data mahasiswa") }
    finally {
      Promise.resolve().then(() => setLoading(false))
    }
  }, [])

  const filteredStudentData = useMemo(() => {
    return studentData.filter(s => {
      if (filterPeriod === 'all') return true;
      const angkatan = s.TahunMasuk || (s.NIM ? `20${s.NIM.substring(0,2)}` : null);
      return String(angkatan) === filterPeriod;
    });
  }, [studentData, filterPeriod]);

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
      .badge-aktif   { background:#dcfce7; color:#15803d; border:1px solid #bbf7d0; }
      .badge-lulus   { background:#e0f2fe; color:#0284c7; border:1px solid #bae6fd; }
      .badge-cuti    { background:#fef9c3; color:#a16207; border:1px solid #fef08a; }
      .badge-nonaktif{ background:#fee2e2; color:#b91c1c; border:1px solid #fecaca; }
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
    </body></html>`;
    
    try {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          setTimeout(() => { printWindow.close(); }, 100);
        }, 300);
      };
    } catch (err) {
      console.error("Print Error:", err);
      toast.error("Gagal memproses PDF, mungkin karena ekstensi browser.");
    }
  };

  const exportStudentsPDF = () => {
    if (studentData.length === 0) { toast.error('Tidak ada data mahasiswa untuk diekspor'); return; }
    const dataToExport = studentData;
    const statusBadge = (s) => {
      const key = (s || '').toLowerCase();
      if (key === 'aktif' || key === 'active') return '<span class="badge badge-aktif">Aktif</span>';
      if (key === 'lulus') return '<span class="badge badge-lulus">Lulus</span>';
      if (key === 'cuti' || key === 'leave') return '<span class="badge badge-cuti">Cuti</span>';
      return '<span class="badge badge-nonaktif">Non-Aktif</span>';
    };
    let tableRows = '';
    dataToExport.forEach((item, idx) => {
      tableRows += `<tr>
        <td>${idx + 1}</td>
        <td style="font-family:monospace;font-weight:700;color:#00236F;font-size:7.5px;">${item.NIM || '—'}</td>
        <td style="font-weight:700;">${item.Nama || '—'}</td>
        <td>${item.ProgramStudi || '—'}</td>
        <td style="text-align:center;font-weight:700;">${item.SemesterSekarang || '—'}</td>
        <td>${item.TahunMasuk || '—'}</td>
        <td>${item.JalurMasuk || '—'}</td>
        <td>${statusBadge(item.StatusAkun)}</td>
      </tr>`;
    });
    const aktif = dataToExport.filter(d => d.StatusAkun === 'Aktif' || d.StatusAkun === 'active').length;
    const lulus = dataToExport.filter(d => d.StatusAkun === 'Lulus').length;
    const cuti = dataToExport.filter(d => d.StatusAkun === 'Cuti' || d.StatusAkun === 'leave').length;
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
      `Rekap Data Akademik Mahasiswa — ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`,
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

  const columns = useMemo(() => [
    { label: 'NIM', key: 'NIM', render: (val) => <code className="text-[11px] font-bold text-primary tracking-wide bg-[#eff6ff] px-2 py-1 rounded-lg border border-[#dbeafe]">{val || '—'}</code> },
    { label: 'Identitas Mahasiswa', key: 'Nama', render: (val, row) => (
        <div className="flex items-center gap-3">
          <StudentAvatar src={row.Foto} name={row.Nama} className="w-9 h-9 rounded-xl" />
          <div>
            <p className="font-bold text-[13px] text-slate-900 leading-snug">{row.Nama}</p>
            <p className="text-[10px] text-slate-500 font-medium">{row.TahunMasuk} · {row.JalurMasuk}</p>
          </div>
        </div>
      ) 
    },
    { label: 'Program Studi', key: 'ProgramStudi' },
    { label: 'Smt', key: 'SemesterSekarang', className: 'text-center', render: (val) => <span className="text-sm font-black text-slate-900 tabular-nums">{val ?? '—'}</span> },
    { label: 'Status', key: 'StatusAkun', render: (val) => {
        const st = STATUS_STYLES[val] || STATUS_STYLES['Non-Aktif']
        return (
          <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider whitespace-nowrap', st.cls)}>
            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', st.dot)} />
            {val}
          </span>
        )
      } 
    }
  ], [])

  const filtersConfig = useMemo(() => [
    {
      key: 'ProgramStudi',
      placeholder: 'Program Studi',
      options: prodiList.map(p => ({ label: p, value: p }))
    },
    {
      key: 'SemesterSekarang',
      placeholder: 'Semester',
      options: semesterList.map(s => ({ label: `Semester ${s}`, value: String(s) }))
    },
    {
      key: 'TahunMasuk',
      placeholder: 'Angkatan',
      options: angkatanList.map(a => ({ label: `Angkatan ${a}`, value: String(a) }))
    },
    {
      key: 'StatusAkun',
      placeholder: 'Status',
      options: statusList.map(s => ({ label: s, value: s }))
    }
  ], [prodiList, semesterList, angkatanList, statusList])

  const stats = {
    total: filteredStudentData.length,
    aktif: filteredStudentData.filter(d => d.StatusAkun === 'Aktif' || d.StatusAkun === 'active').length,
    lulus: filteredStudentData.filter(d => d.StatusAkun === 'Lulus').length,
    cuti: filteredStudentData.filter(d => d.StatusAkun === 'Cuti' || d.StatusAkun === 'leave').length,
  }

  return (
    <PageContent>
      <Toaster position="top-right" />

      <DashboardHero
        title="Database"
        highlightedTitle="Mahasiswa"
        subtitle="Manajemen data dan arsip akademik seluruh mahasiswa di lingkungan fakultas."
        icon="group"
        badges={[
          { label: 'Data Akademik', active: false },
          { label: `${stats.aktif} Mahasiswa Aktif`, active: true },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-[180px] h-10 border border-slate-200/80 bg-white/80 rounded-xl text-xs font-bold text-slate-600 focus:ring-0">
                <SelectValue placeholder="Semua Periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Angkatan</SelectItem>
                {angkatanList.map(a => <SelectItem key={a} value={String(a)}>Angkatan {a}</SelectItem>)}
              </SelectContent>
            </Select>
            <button onClick={exportStudentsPDF} disabled={loading || filteredStudentData.length === 0}
              className="h-10 px-4 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-sm text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-primary hover:border-primary/30 hover:bg-slate-50/50 shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-50 flex items-center gap-2">
              <FileText size={13} className="text-primary" /> Ekspor PDF
            </button>
            <button onClick={handleSync} disabled={isSyncing}
              className="h-10 px-4 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-sm text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-primary hover:border-primary/30 hover:bg-slate-50/50 shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-60 flex items-center gap-2">
              {isSyncing ? <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '13px' }} >sync</span> : <RefreshCw size={13} className="text-primary" />} {isSyncing ? 'Syncing...' : 'PDDIKTI Sync'}
            </button>
          </div>
        }
      />

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <PrimaryStatsCard
            title="Total Mahasiswa"
            value={loading ? <span className="material-symbols-outlined animate-spin text-slate-300" style={{ fontSize: '18px' }} >sync</span> : stats.total}
            subtitle="Terdaftar di sistem"
            icon="group"
            colorTheme="primary"
          />
          <PrimaryStatsCard
            title="Aktif"
            value={loading ? <span className="material-symbols-outlined animate-spin text-slate-300" style={{ fontSize: '18px' }} >sync</span> : stats.aktif}
            subtitle="Sedang aktif kuliah"
            icon="verified_user"
            colorTheme="success"
          />
          <PrimaryStatsCard
            title="Lulus"
            value={loading ? <span className="material-symbols-outlined animate-spin text-slate-300" style={{ fontSize: '18px' }} >sync</span> : stats.lulus}
            subtitle="Telah menyelesaikan studi"
            icon="school"
            colorTheme="info"
          />
          <PrimaryStatsCard
            title="Cuti"
            value={loading ? <span className="material-symbols-outlined animate-spin text-slate-300" style={{ fontSize: '18px' }} >sync</span> : stats.cuti}
            subtitle="Sedang dalam masa cuti"
            icon="calendar_month"
            colorTheme="warning"
          />
        </div>

        {/* ── Table Card ── */}
        <DataTable
          columns={columns}
          data={filteredStudentData}
          loading={loading}
          searchPlaceholder="Cari NIM, nama, atau prodi..."
          filters={filtersConfig}
          actions={(row) => (
            <button
              onClick={() => setSelected(row)}
              className="p-1.5 text-slate-400 hover:text-primary hover:bg-[#eef4ff] rounded-lg transition-colors"
              title="Lihat Detail"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >visibility</span>
            </button>
          )}
        />

      {/* ── Detail Modal ── */}
      <DialogModal
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        icon="person"
        title="Detail Mahasiswa"
        subtitle="Informasi akademik dan biodata lengkap"
        badgeText="Profil Mahasiswa"
        maxWidth="max-w-xl"
        bodyClassName="p-0 flex flex-col"
        footer={<ModalCancelButton onClick={() => setSelected(null)} text="Tutup" />}
      >
          {/* Header */}
          <div className="shrink-0 relative bg-[var(--theme-bg)]/50 p-6 pb-5 border-b border-[var(--theme-border-muted)]">
            <div className="relative z-10 flex items-center gap-4 mb-4">
              <StudentAvatar src={selected?.Foto} name={selected?.Nama} className="w-14 h-14 rounded-2xl shadow-inner ring-2 ring-[var(--theme-border)]" />
              <div className="min-w-0">
                <p className="text-[9px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-[0.25em] mb-1">Profil Mahasiswa</p>
                <h3 className="text-base font-bold font-headline leading-tight truncate text-[var(--theme-text)]">{selected?.Nama}</h3>
                <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">{selected?.ProgramStudi}</p>
              </div>
            </div>
            <div className="relative z-10 flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 bg-[var(--theme-primary-light)] border border-[var(--theme-primary)]/10 px-3 py-1 rounded-full text-[10px] font-semibold text-[var(--theme-primary)] font-mono tracking-wider">
                NIM {selected?.NIM}
              </span>
              <span className="flex items-center gap-1.5 bg-[var(--theme-primary-light)] border border-[var(--theme-primary)]/10 px-3 py-1 rounded-full text-[10px] font-semibold text-[var(--theme-primary)] uppercase tracking-wider">
                <Award size={10} /> Angkatan {selected?.TahunMasuk}
              </span>
              {selected?.StatusAkun && (() => {
                const st = STATUS_STYLES[selected.StatusAkun] || STATUS_STYLES['Non-Aktif']
                return (
                  <span className={cn('flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold border uppercase tracking-wider', st.cls)}>
                    <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', st.dot)} />
                    {selected.StatusAkun}
                  </span>
                )
              })()}
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {/* Akademik */}
            <SectionBlock icon={BookOpen} title="Informasi Akademik">
              <InfoCard icon={Building2} label="Program Studi" value={selected?.ProgramStudi} accent="border-l-[var(--theme-info)]" />
              <InfoCard icon={Layers} label="Semester" value={selected?.SemesterSekarang ? `Semester ${selected.SemesterSekarang}` : '—'} accent="border-l-[var(--theme-primary)]" />
              <InfoCard icon={UserCheck} label="Dosen PA / Wali" value={selected?.DosenPA} accent="border-l-[var(--theme-success)]" />
              <InfoCard icon={Award} label="Jalur Masuk" value={selected?.JalurMasuk} accent="border-l-[var(--theme-warning)]" />
            </SectionBlock>

            {/* Biodata */}
            <SectionBlock icon={FileText} title="Biodata & Kontak">
              <InfoCard icon={Calendar} label="Tempat, Tgl Lahir" value={selected ? `${selected.TempatLahir}, ${formatDate(selected.TanggalLahir)}` : ''} accent="border-l-[var(--theme-error)]" />
              <InfoCard icon={Phone} label="No. HP / WhatsApp" value={selected?.NoHP} accent="border-l-[var(--theme-success)]" />
              <InfoCard icon={Mail} label="Email Institusi" value={selected?.Email} accent="border-l-[var(--theme-info)]" mono />
              <InfoCard icon={MapPin} label="Alamat" value={selected?.Alamat} accent="border-l-[var(--theme-text-subtle)]" />
            </SectionBlock>

            {/* Orang Tua */}
            <SectionBlock icon={Heart} title="Data Orang Tua" last>
              <InfoCard icon={Users} label="Nama Ayah" value={selected?.NamaAyah} accent="border-l-[var(--theme-info)]" />
              <InfoCard icon={Users} label="Nama Ibu" value={selected?.NamaIbu} accent="border-l-[var(--theme-error)]" />
              <InfoCard icon={Award} label="Pekerjaan" value={selected?.PekerjaanOrtu} accent="border-l-[var(--theme-warning)]" />
              <InfoCard icon={FileText} label="Penghasilan" value={selected?.PenghasilanOrtu ? `Rp ${Number(selected.PenghasilanOrtu).toLocaleString('id-ID')}` : '—'} accent="border-l-[var(--theme-success)]" />
            </SectionBlock>
          </div>
      </DialogModal>
    </PageContent>
  )
}

function SectionBlock({ icon, title, children, last = false }) {
  const IconComponent = icon
  return (
    <div className={cn('p-5', !last && 'border-b border-[var(--theme-border-muted)]')}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded-md bg-[var(--theme-primary-light)] flex items-center justify-center">
          <IconComponent size={11} className="text-[var(--theme-primary)]" />
        </div>
        <h3 className="text-[10px] font-bold font-headline uppercase tracking-[0.18em] text-[var(--theme-text)]">{title}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
    </div>
  )
}

function InfoCard({ icon, label, value, accent = 'border-l-[var(--theme-text-subtle)]', mono = false }) {
  const IconComponent = icon
  const empty = !value || value === '—'
  return (
    <div className={cn('flex items-start gap-3 p-3.5 rounded-xl bg-white border border-[var(--theme-border-muted)] border-l-4 group hover:shadow-md hover:border-[var(--theme-border)] transition-all duration-300', accent)}>
      <div className="w-8 h-8 bg-[var(--theme-bg)] rounded-lg flex items-center justify-center text-[var(--theme-primary)] shadow-sm border border-[var(--theme-border-muted)] flex-shrink-0 group-hover:scale-110 transition-transform">
        <IconComponent size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-bold text-[var(--theme-text-muted)] uppercase tracking-widest mb-1">{label}</p>
        <p className={cn('text-[13px] font-bold text-[var(--theme-text)] truncate', mono && 'font-mono text-xs', empty && 'text-[var(--theme-text-subtle)] italic font-medium')}>
          {empty ? 'Belum diisi' : value}
        </p>
      </div>
    </div>
  )
}

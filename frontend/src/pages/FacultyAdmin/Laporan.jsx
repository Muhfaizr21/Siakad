"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { toast, Toaster } from "react-hot-toast"
import useAuthStore from "../../store/useAuthStore"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { cn } from "@/lib/utils"
import { API_BASE_URL } from "../../services/api"

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Download = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>download</span>;
const RefreshCw = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>sync</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const HeartPulse = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>monitor_heart</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Users = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>group</span>;
const Award = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>emoji_events</span>;
const Globe = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>public</span>;



const API = `${API_BASE_URL}/faculty`
const CHART_COLORS = ["#3b82f6","#10b981","#f59e0b","#6366f1","#ec4899"]

export default function LaporanFakultasPage() {
  const [data, setData] = useState({ summary:{ total:0, active:0, graduated:0, avgIPK:0, totalPrestasi:0, totalBeasiswa:0, totalKonseling:0 }, perAngkatan:[], perProdi:[], ipkDist:[] })
  const [loading, setLoading]   = useState(true)
  const [isMounted, setMounted] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = useAuthStore.getState().accessToken;
      const res = await axios.get(`${API}/reports/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.status === "success") setData(res.data.data || data)
    } catch { toast.error("Gagal memuat data laporan") }
    finally { setLoading(false) }
  }

  const downloadPDF = (title, subtitle, contentHtml) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Gagal membuka jendela cetak. Pastikan pop-up browser tidak diblokir.");
      return;
    }

    const htmlContent = `<html>
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  @page {
    size: A4 portrait;
    margin: 20mm;
  }
  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    line-height: 1.5;
    color: #334155;
    background-color: #ffffff;
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .letterhead {
    width: 100%;
    margin-bottom: 20px;
  }
  .letterhead-table {
    width: 100%;
    border-collapse: collapse;
    border: none;
  }
  .letterhead-table td {
    border: none;
    padding: 0;
  }
  .univ-title {
    font-size: 13px;
    font-weight: 700;
    color: #00236F;
    font-family: 'Times New Roman', Times, serif;
    letter-spacing: 0.5px;
  }
  .univ-main {
    font-size: 18px;
    font-weight: 800;
    color: #00236F;
    font-family: 'Times New Roman', Times, serif;
    margin-top: 2px;
  }
  .univ-address {
    font-size: 9px;
    color: #475569;
    margin-top: 5px;
    font-weight: 500;
  }
  .univ-contact {
    font-size: 9px;
    color: #00236F;
    margin-top: 2px;
    font-weight: 600;
  }
  .double-line {
    border: 0;
    border-top: 3px double #00236F;
    margin-top: 10px;
    margin-bottom: 20px;
  }
  h1 {
    color: #1e293b;
    text-align: center;
    font-size: 15px;
    font-weight: 800;
    margin-top: 10px;
    margin-bottom: 3px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  h2 {
    color: #64748b;
    text-align: center;
    font-size: 9px;
    font-weight: 700;
    margin-top: 0;
    margin-bottom: 25px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  h3 {
    color: #00236F;
    font-size: 12px;
    font-weight: 700;
    margin-top: 20px;
    margin-bottom: 10px;
    border-left: 3px solid #00236F;
    padding-left: 8px;
    text-transform: uppercase;
  }
  .meta-table {
    width: 100%;
    border-collapse: collapse;
    border: none;
    margin-bottom: 15px;
  }
  .meta-table td {
    border: none;
    padding: 0 8px;
    width: 50%;
  }
  .meta-box {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 12px 15px;
    border-radius: 6px;
  }
  .meta-title {
    font-size: 8px;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    margin-bottom: 2px;
    letter-spacing: 0.5px;
  }
  .meta-value {
    font-size: 14px;
    font-weight: 700;
    color: #00236F;
  }
  table.data-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    margin-bottom: 20px;
  }
  table.data-table th {
    background-color: #00236F;
    color: #ffffff;
    font-weight: 700;
    text-align: left;
    padding: 8px 10px;
    border: 1px solid #cbd5e1;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  table.data-table td {
    padding: 8px 10px;
    border: 1px solid #cbd5e1;
    font-size: 9px;
    color: #334155;
  }
  table.data-table tr:nth-child(even) td {
    background-color: #f8fafc;
  }
  .badge {
    display: inline-block;
    padding: 2px 6px;
    font-size: 8px;
    font-weight: 700;
    border-radius: 4px;
    text-transform: uppercase;
  }
  .badge-success {
    background-color: #dcfce7;
    color: #15803d;
    border: 1px solid #bbf7d0;
  }
  .badge-info {
    background-color: #dbeafe;
    color: #1d4ed8;
    border: 1px solid #bfdbfe;
  }
  .badge-warning {
    background-color: #fef9c3;
    color: #a16207;
    border: 1px solid #fef08a;
  }
  .footer {
    margin-top: 40px;
    text-align: right;
    font-size: 9px;
    color: #64748b;
  }
  .sig-line {
    width: 160px;
    border-top: 1px solid #94a3b8;
    margin-top: 45px;
    display: inline-block;
  }
  @media print {
    body {
      background-color: #ffffff;
    }
    .no-print {
      display: none;
    }
  }
</style>
</head>
<body>
  <div class="letterhead">
    <table class="letterhead-table">
      <tr>
        <td style="width: 15%; text-align: left;">
          <img src="https://bku.ac.id/wp-content/uploads/2021/01/logo-bku-nav.png" alt="Logo BKU" style="height: 55px; width: auto; object-fit: contain;" onerror="this.src='https://bku.ac.id/wp-content/uploads/2021/01/logo-bku.png'; this.onerror=null;"/>
        </td>
        <td style="width: 85%; text-align: center;">
          <div class="univ-title">YAYASAN ADHI GUNA KENCANA</div>
          <div class="univ-main">UNIVERSITAS BHAKTI KENCANA</div>
          <div class="univ-address">Jl. Soekarno Hatta No. 754, Cipadung Kidul, Panyileukan, Kota Bandung, Jawa Barat 40614</div>
          <div class="univ-contact">Telp: (022) 7800570 | Email: info@bku.ac.id | Website: www.bku.ac.id</div>
        </td>
      </tr>
    </table>
    <hr class="double-line" />
  </div>

  <h1>${title}</h1>
  <h2>${subtitle}</h2>

  ${contentHtml}

  <div class="footer">
    <p>Dicetak secara otomatis oleh Portal Akademik Fakultas</p>
    <p>Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB</p>
    <br/>
    <p>Mengetahui,</p>
    <p style="font-weight: 700; margin-top: 5px;">Dekan Bidang Akademik</p>
    <div class="sig-line"></div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
        setTimeout(function() {
          window.close();
        }, 100);
      }, 300);
    };
  </script>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const exportProdiPDF = () => {
    if (!data.perProdi || data.perProdi.length === 0) {
      toast.error("Tidak ada data prodi untuk diekspor");
      return;
    }
    
    let tableRows = "";
    data.perProdi.forEach(p => {
      tableRows += `
        <tr>
          <td style="font-weight: 700;">${p.nama_prodi}</td>
          <td>${p.active || 0} Mahasiswa</td>
          <td>${p.graduated || 0} Lulusan</td>
          <td style="font-weight: 700; text-align: right;">${p.avgIPK ? p.avgIPK.toFixed(2) : "0.00"}</td>
        </tr>`;
    });

    const contentHtml = `
      <h3>Ringkasan Sebaran Akademik</h3>
      <table class="meta-table">
        <tr>
          <td style="padding-left: 0;">
            <div class="meta-box">
              <div class="meta-title">Total Mahasiswa Terdaftar</div>
              <div class="meta-value">${data.summary.total} Orang</div>
            </div>
          </td>
          <td style="padding-right: 0;">
            <div class="meta-box">
              <div class="meta-title">Rata-rata IPK Fakultas</div>
              <div class="meta-value">${data.summary.avgIPK ? data.summary.avgIPK.toFixed(2) : "0.00"}</div>
            </div>
          </td>
        </tr>
      </table>

      <h3>Daftar Capaian per Program Studi</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>Program Studi</th>
            <th>Mahasiswa Aktif</th>
            <th>Lulusan</th>
            <th style="text-align: right;">Rata-Rata IPK</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;

    downloadPDF(
      "Laporan Rekapitulasi Program Studi",
      "Kondisi Akademik & Capaian Nilai Rata-Rata Mahasiswa",
      contentHtml
    );
    toast.success("Berhasil mencetak Laporan Prodi!");
  };

  const downloadPrestasiPDF = async () => {
    try {
      toast.loading("Menyiapkan dokumen Laporan Prestasi...", { id: "prestasi-dl" });
      const token = useAuthStore.getState().accessToken;
      const res = await axios.get(`${API}/prestasi`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status === "success") {
        const list = res.data.data || [];
        if (list.length === 0) {
          toast.dismiss("prestasi-dl");
          toast.error("Belum ada data prestasi untuk diekspor");
          return;
        }

        let tableRows = "";
        list.forEach((item, idx) => {
          const statusLabel = item.Status === "verified" || item.Status === "terverifikasi" || item.Status === "disetujui" 
            ? '<span class="badge badge-success">Terverifikasi</span>' 
            : item.Status?.toLowerCase().includes("tolak") || item.Status === "rejected"
            ? '<span class="badge badge-warning">Ditolak</span>'
            : '<span class="badge badge-info">Menunggu</span>';

          tableRows += `
            <tr>
              <td>${idx + 1}</td>
              <td style="font-weight: 700;">${item.Mahasiswa?.Nama || "—"}<br/><span style="font-size: 8px; color: #64748b;">NIM: ${item.Mahasiswa?.NIM || "—"}</span></td>
              <td>${item.NamaKegiatan || "—"}<br/><span style="font-size: 8px; color: #1d4ed8; font-weight: 700;">${item.Kategori || "Umum"}</span></td>
              <td>${item.Tingkat || "—"}</td>
              <td>${item.Peringkat || "—"}</td>
              <td style="font-weight: 700;">${item.Poin || 0} Poin</td>
              <td>${statusLabel}</td>
            </tr>`;
        });

        const contentHtml = `
          <h3>Ringkasan Capaian Prestasi Mahasiswa</h3>
          <table class="meta-table">
            <tr>
              <td style="padding-left: 0;">
                <div class="meta-box">
                  <div class="meta-title">Total Pengajuan Prestasi</div>
                  <div class="meta-value">${list.length} Capaian</div>
                </div>
              </td>
              <td style="padding-right: 0;">
                <div class="meta-box">
                  <div class="meta-title">Tervalidasi Fakultas</div>
                  <div class="meta-value">${list.filter(a => ["verified", "terverifikasi", "disetujui"].includes((a.Status || "").toLowerCase())).length} Pengajuan</div>
                </div>
              </td>
            </tr>
          </table>

          <h3>Daftar Detail Prestasi & Penghargaan</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 5%;">No</th>
                <th style="width: 25%;">Mahasiswa</th>
                <th style="width: 30%;">Prestasi / Penghargaan</th>
                <th style="width: 10%;">Tingkat</th>
                <th style="width: 10%;">Peringkat</th>
                <th style="width: 10%;">Poin</th>
                <th style="width: 10%;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        `;

        downloadPDF(
          "Laporan Prestasi & Capaian Mahasiswa",
          "Dataset Rekapitulasi Kompetisi Dan Penghargaan Mahasiswa Fakultas",
          contentHtml
        );
        toast.dismiss("prestasi-dl");
        toast.success("Berhasil mencetak Laporan Prestasi!");
      } else {
        toast.dismiss("prestasi-dl");
        toast.error("Gagal memuat data prestasi");
      }
    } catch (err) {
      toast.dismiss("prestasi-dl");
      toast.error("Terjadi kesalahan sistem saat memproses PDF");
    }
  };

  const downloadBeasiswaPDF = async () => {
    try {
      toast.loading("Menyiapkan dokumen Laporan Beasiswa...", { id: "beasiswa-dl" });
      const token = useAuthStore.getState().accessToken;
      const res = await axios.get(`${API}/scholarships`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status === "success") {
        const list = res.data.data || [];
        if (list.length === 0) {
          toast.dismiss("beasiswa-dl");
          toast.error("Belum ada data beasiswa untuk diekspor");
          return;
        }

        let tableRows = "";
        list.forEach((item, idx) => {
          tableRows += `
            <tr>
              <td>${idx + 1}</td>
              <td style="font-weight: 700; color: #00236F;">${item.Nama || "—"}</td>
              <td>${item.Penyelenggara || "—"}</td>
              <td style="font-weight: 700;">${item.Kuota || 0} Penerima</td>
              <td>${item.Deskripsi || "—"}</td>
              <td>${item.IsActive ? '<span class="badge badge-success">Aktif</span>' : '<span class="badge badge-info">Non-Aktif</span>'}</td>
            </tr>`;
        });

        const contentHtml = `
          <h3>Daftar Program Beasiswa Internal & Eksternal</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 5%;">No</th>
                <th style="width: 25%;">Nama Beasiswa</th>
                <th style="width: 20%;">Penyelenggara</th>
                <th style="width: 15%;">Kuota Penerima</th>
                <th style="width: 25%;">Deskripsi Program</th>
                <th style="width: 10%;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        `;

        downloadPDF(
          "Laporan Program Beasiswa Mahasiswa",
          "Dataset Penyelenggaraan Bantuan Finansial Dan Beasiswa Internal",
          contentHtml
        );
        toast.dismiss("beasiswa-dl");
        toast.success("Berhasil mencetak Laporan Beasiswa!");
      } else {
        toast.dismiss("beasiswa-dl");
        toast.error("Gagal memuat data beasiswa");
      }
    } catch (err) {
      toast.dismiss("beasiswa-dl");
      toast.error("Terjadi kesalahan sistem saat memproses PDF");
    }
  };

  const downloadKonselingPDF = async () => {
    try {
      toast.loading("Menyiapkan dokumen Laporan Konseling...", { id: "konseling-dl" });
      const token = useAuthStore.getState().accessToken;
      const res = await axios.get(`${API}/counseling`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status === "success") {
        const list = res.data.data || [];
        if (list.length === 0) {
          toast.dismiss("konseling-dl");
          toast.error("Belum ada sesi konseling untuk diekspor");
          return;
        }

        let tableRows = "";
        list.forEach((item, idx) => {
          tableRows += `
            <tr>
              <td>${idx + 1}</td>
              <td style="font-weight: 700;">${item.Mahasiswa?.Nama || "—"}<br/><span style="font-size: 8px; color: #64748b;">NIM: ${item.Mahasiswa?.NIM || "—"}</span></td>
              <td>${item.DosenKonselor || "—"}</td>
              <td>${item.TanggalSesi ? new Date(item.TanggalSesi).toLocaleDateString('id-ID') : "—"}</td>
              <td>${item.Keluhan || "—"}</td>
              <td style="font-weight: 700; color: #00236F;">${item.Status || "—"}</td>
            </tr>`;
        });

        const contentHtml = `
          <h3>Rekapitulasi Layanan Sesi Konseling & Bimbingan</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 5%;">No</th>
                <th style="width: 25%;">Mahasiswa</th>
                <th style="width: 20%;">Dosen Konselor</th>
                <th style="width: 15%;">Tanggal</th>
                <th style="width: 25%;">Masalah / Keluhan</th>
                <th style="width: 10%;">Status Sesi</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        `;

        downloadPDF(
          "Laporan Layanan Konseling & Pendampingan",
          "Dataset Sesi Bimbingan, Konseling, Dan Masalah Kesehatan Mahasiswa Fakultas",
          contentHtml
        );
        toast.dismiss("konseling-dl");
        toast.success("Berhasil mencetak Laporan Konseling!");
      } else {
        toast.dismiss("konseling-dl");
        toast.error("Gagal memuat data konseling");
      }
    } catch (err) {
      toast.dismiss("konseling-dl");
      toast.error("Terjadi kesalahan sistem saat memproses PDF");
    }
  };

  useEffect(() => { setMounted(true); fetchData() }, [])

  const prodiWithColors = (data.perProdi||[]).map((item,i)=>({...item, nama_prodi:item.nama_prodi||"Unknown", value:item.value||0, color:CHART_COLORS[i%CHART_COLORS.length]}))

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
              <div className="flex items-center gap-2 mb-2"><div className="h-4 w-1.5 bg-primary rounded-full"/><span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">Monitoring Strategis</span></div>
              <h1 className="text-3xl font-extrabold text-slate-900 font-headline tracking-tight">Laporan <span className="text-primary">Fakultas</span></h1>
              <p className="text-slate-500 font-medium text-sm max-w-xl leading-relaxed mt-1">Dashboard analitik performa akademik dan layanan kemahasiswaan.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={exportProdiPDF} className="h-11 px-5 rounded-xl border border-[#e5e5e5] bg-white text-xs font-bold uppercase tracking-widest text-[#525252] hover:bg-[#fafafa] gap-2 flex items-center transition-all active:scale-95 shadow-sm">
                <Download size={14} className="text-primary"/> Ekspor
              </button>
              <button onClick={fetchData} disabled={loading} className="h-11 px-5 rounded-xl border border-[#e5e5e5] bg-white text-xs font-bold uppercase tracking-widest text-[#525252] hover:bg-[#fafafa] gap-2 flex items-center transition-all active:scale-95 shadow-sm disabled:opacity-60">
                {loading?<span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '14px' }} >sync</span>:<RefreshCw size={14} className="text-primary"/>} Refresh
              </button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {label:'Total Mahasiswa',    value:data.summary.total,          icon:Users,     bg:'bg-[#eef4ff]',  color:'text-[#00236F]',   desc:'Terdaftar aktif'},
            {label:'Capaian Prestasi',   value:data.summary.totalPrestasi,  icon:Award,     bg:'bg-emerald-50', color:'text-emerald-600', desc:'Kompetisi & penghargaan'},
            {label:'Penerima Beasiswa',  value:data.summary.totalBeasiswa,  icon:Globe,     bg:'bg-indigo-50',  color:'text-indigo-600',  desc:'Bantuan finansial'},
            {label:'Layanan Konseling',  value:data.summary.totalKonseling, icon:HeartPulse,bg:'bg-rose-50',    color:'text-rose-600',    desc:'Sesi bimbingan'},
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

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-base text-[#171717] mb-1">Status per Angkatan</h3>
            <p className="text-xs text-[#a3a3a3] mb-5">Distribusi akademik tiap tahun angkatan</p>
            <div className="h-64">
              {isMounted && (
                <ResponsiveContainer width="99%" height="100%" debounce={50}>
                  <BarChart data={data.perAngkatan} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                    <XAxis dataKey="angkatan" axisLine={false} tickLine={false} tick={{fontSize:10,fontWeight:700}}/>
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize:10,fontWeight:700}}/>
                    <Tooltip contentStyle={{borderRadius:'12px',border:'none',boxShadow:'0 10px 25px -5px rgba(0,0,0,.1)',fontSize:'11px',fontWeight:'bold'}} cursor={{fill:'#f8fafc'}}/>
                    <Bar dataKey="aktif" name="Aktif" fill="#3b82f6" radius={[4,4,0,0]} barSize={20}/>
                    <Bar dataKey="lulus" name="Lulus" fill="#10b981" radius={[4,4,0,0]} barSize={20}/>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-base text-[#171717] mb-1">Distribusi Prodi</h3>
            <p className="text-xs text-[#a3a3a3] mb-5">Persentase jumlah mahasiswa per program studi</p>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="h-56 flex-1 min-w-0">
                {isMounted && (
                  <ResponsiveContainer width="99%" height="100%" debounce={50}>
                    <PieChart>
                      <Pie data={prodiWithColors} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
                        {prodiWithColors.map((entry,i)=><Cell key={i} fill={entry.color} stroke="none"/>)}
                      </Pie>
                      <Tooltip contentStyle={{borderRadius:'12px',border:'none',boxShadow:'0 10px 25px -5px rgba(0,0,0,.1)',fontSize:'11px',fontWeight:'bold'}}/>
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="flex flex-col gap-2.5 min-w-[130px]">
                {prodiWithColors.map((p,i)=>(
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{backgroundColor:p.color}}/>
                    <div>
                      <p className="text-[10px] font-black text-[#171717] uppercase tracking-tight truncate max-w-[110px]">{p.nama_prodi}</p>
                      <p className="text-[9px] text-[#a3a3a3] font-bold">{p.value} Mahasiswa</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {label:'Laporan Prestasi',  icon:Award,     bg:'bg-emerald-600', light:'bg-emerald-50', stat:`${data.summary.totalPrestasi} Capaian`,  desc:'Dataset kompetisi & penghargaan mahasiswa.', handler: downloadPrestasiPDF},
            {label:'Laporan Beasiswa',  icon:Globe,     bg:'bg-indigo-600',  light:'bg-indigo-50',  stat:`${data.summary.totalBeasiswa} Penerima`, desc:'Transkrip penerima bantuan finansial.', handler: downloadBeasiswaPDF},
            {label:'Laporan Konseling', icon:HeartPulse,bg:'bg-rose-600',    light:'bg-rose-50',    stat:`${data.summary.totalKonseling} Sesi`,     desc:'Monitoring layanan bimbingan & kesehatan.', handler: downloadKonselingPDF},
          ].map((item,i)=>(
            <div key={i} className="bg-white border border-[#e5e5e5] rounded-2xl p-5 shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-5">
                <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg',item.bg)}><item.icon size={20}/></div>
                <span className="text-[9px] font-black text-[#a3a3a3] bg-[#f5f5f5] px-2.5 py-1 rounded-lg uppercase tracking-wider">SEM-II 2024</span>
              </div>
              <h4 className="text-base font-extrabold text-[#171717] mb-1">{item.label}</h4>
              <p className="text-xs text-[#a3a3a3] mb-5 leading-relaxed">{item.desc}</p>
              <div className="flex items-center justify-between pt-4 border-t border-[#f0f0f0]">
                <div>
                  <p className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Master Data</p>
                  <p className="text-sm font-black text-[#171717] tabular-nums">{item.stat}</p>
                </div>
                <button onClick={item.handler} className="w-10 h-10 rounded-xl bg-[#171717] text-white flex items-center justify-center hover:bg-primary transition-colors active:scale-95"><Download size={15}/></button>
              </div>
            </div>
          ))}
        </div>

        {/* Per-Prodi Table */}
        <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#f0f0f0]">
            <h2 className="font-bold text-base text-[#171717]">Rekap Per Program Studi</h2>
            <p className="text-xs text-[#737373] mt-0.5">Data akademik terbaru tiap prodi</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="border-b border-[#e5e5e5]">
                {['Program Studi','Mahasiswa Aktif','Lulusan','Rata-rata IPK'].map(h=>(
                  <th key={h} className="px-5 py-3.5 text-xs font-bold text-[#a3a3a3] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {loading?Array.from({length:4}).map((_,i)=>(
                  <tr key={i} className="border-b border-[#f0f0f0]">{[...Array(4)].map((__,j)=><td key={j} className="px-5 py-4"><div className="h-4 bg-[#f5f5f5] rounded animate-pulse"/></td>)}</tr>
                )):(data.perProdi||[]).map((row,i)=>(
                  <tr key={i} className="border-b border-[#f5f5f5] hover:bg-[#fafbff] transition-colors">
                    <td className="px-5 py-3.5 font-bold text-sm text-[#171717]">{row.nama_prodi}</td>
                    <td className="px-5 py-3.5"><span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-lg text-xs font-black">{row.active||0}</span></td>
                    <td className="px-5 py-3.5"><span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-lg text-xs font-black">{row.graduated||0}</span></td>
                    <td className="px-5 py-3.5 font-black text-sm text-[#171717] tabular-nums">{row.avgIPK?.toFixed(2)||'0.00'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

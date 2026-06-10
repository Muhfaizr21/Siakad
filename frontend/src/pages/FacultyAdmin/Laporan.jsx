"use client"

import React, { useState, useEffect } from "react"
import api from "../../lib/axios"
import { toast, Toaster } from "react-hot-toast"
import useAuthStore from "../../store/useAuthStore"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { cn } from "@/lib/utils"
import { PageContent } from "@/components/ui/page/PageContent"
import { DashboardHero } from "@/components/ui/dashboard/DashboardHero"
import { PrimaryStatsCard } from '@/components/ui/StatsCard'
import { Card, CardContent } from '@/components/ui/Card'
import { DataTable } from '@/components/ui/DataTable'

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Download = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>download</span>;
const RefreshCw = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>sync</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const HeartPulse = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>monitor_heart</span>;
const Psychology = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>psychology</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Users = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>group</span>;
const Award = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>emoji_events</span>;
const Globe = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>public</span>;



const API = "/faculty"
const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#6366f1", "#ec4899"]

export default function LaporanFakultasPage() {
  const [data, setData] = useState({ summary: { total: 0, active: 0, graduated: 0, avgIPK: 0, totalPrestasi: 0, totalBeasiswa: 0, totalKonseling: 0 }, perAngkatan: [], perProdi: [], ipkDist: [] })
  const [loading, setLoading] = useState(true)
  const [isMounted, setMounted] = useState(false)
  const [facultyInfo, setFacultyInfo] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await api.get(`${API}/reports/summary`)
      if (res.data.status === "success") setData(res.data.data || data)

      const profileRes = await api.get(`${API}/profile`)
      if (profileRes.data.success && profileRes.data.data?.fakultas) {
        setFacultyInfo(profileRes.data.data.fakultas)
      }
    } catch { toast.error("Gagal memuat data laporan") }
    finally { setLoading(false) }
  }

  const getKopImage = (facName) => {
    const name = (facName || "").toLowerCase();
    if (name.includes("farmasi")) return "kop_farmasi.jpg";
    if (name.includes("kesehatan") || name.includes("fikes")) return "kop_ilmu_kesehatan.jpg";
    if (name.includes("keperawatan") || name.includes("fkep")) return "kop_keperawatan.jpg";
    if (name.includes("sosial") || name.includes("social") || name.includes("sosiologi") || name.includes("fis")) return "kop_ilmu_sosial.jpg";
    return "kop_farmasi.jpg";
  };

  const downloadPDF = (title, subtitle, contentHtml, existingWindow = null) => {
    const printWindow = existingWindow || window.open('', '_blank');
    if (!printWindow) {
      toast.error("Gagal membuka jendela cetak. Pastikan pop-up browser tidak diblokir.");
      return;
    }

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

    const htmlContent = `<html>
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  @page {
    size: ${printSize};
    margin: 0;
  }
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
  h1 {
    color: #1e293b;
    text-align: center;
    font-size: 14px;
    font-weight: 800;
    margin-top: 0;
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
    color: #df9526;
    font-size: 11px;
    font-weight: 700;
    margin-top: 20px;
    margin-bottom: 8px;
    border-left: 3px solid #df9526;
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
    padding: 10px 12px;
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
    font-size: 13px;
    font-weight: 700;
    color: #1e293b;
  }
  table.data-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    margin-bottom: 20px;
  }
  table.data-table th {
    background-color: #df9526;
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
  .signature-section {
    margin-top: 30px;
    text-align: right;
    font-size: 9px;
    color: #334155;
    float: right;
    width: 250px;
  }
  @media print {
    body {
      background-image: url('${kopImageUrl}') !important;
      background-size: ${bgSize} !important;
      background-repeat: no-repeat !important;
      background-position: top center !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      padding: 38mm 18mm 20mm 18mm !important;
    }
    .no-print {
      display: none;
    }
  }
</style>
</head>
<body>
  <h1>${title}</h1>
  <h2>${subtitle}</h2>

  ${contentHtml}

  <!-- Footer Signature Section -->
  <div style="width: 100%; display: inline-block; margin-top: 15px;">
    <div class="signature-section">
      <p>Dicetak secara otomatis oleh ${footerText}</p>
      <p style="margin-top: 2px;">Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB</p>
      <br/>
      <p>Mengetahui,</p>
      <p style="font-weight: 700; margin-top: 5px;">${titleResolved}</p>
      <div style="margin-top: 45px; font-weight: 700; text-decoration: underline;">${nameResolved}</div>
    </div>
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
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Gagal membuka jendela cetak. Pastikan pop-up browser tidak diblokir.");
      return;
    }
    printWindow.document.write("<html><body><p style='font-family:sans-serif; text-align:center; margin-top:20%; color:#64748b;'>Menyiapkan dokumen Laporan Prestasi...</p></body></html>");

    try {
      toast.loading("Menyiapkan dokumen Laporan Prestasi...", { id: "prestasi-dl" });
      const res = await api.get(`${API}/prestasi`);
      if (res.data.status === "success") {
        const list = (res.data.data || []).map(a => {
          const m = a.mahasiswa || a.Mahasiswa || {};
          return {
            ...a,
            Mahasiswa: { ...m, Nama: m.nama || m.Nama, NIM: m.nim || m.NIM },
            NamaKegiatan: a.nama_kegiatan || a.NamaKegiatan,
            Kategori: a.kategori || a.Kategori,
            Tingkat: a.tingkat || a.Tingkat,
            Peringkat: a.peringkat || a.Peringkat,
            Status: a.status || a.Status,
            Poin: a.poin !== undefined ? a.poin : a.Poin,
          };
        });
        if (list.length === 0) {
          printWindow.close();
          toast.dismiss("prestasi-dl");
          toast.error("Belum ada data prestasi untuk diekspor");
          return;
        }

        let tableRows = "";
        list.forEach((item, idx) => {
          const statusLabel = item.Status === "verified" || item.Status === "terverifikasi" || item.Status === "disetujui"
            ? '<span class="badge badge-success">Terverifikasi</span>'
            : (item.Status || "").toLowerCase().includes("tolak") || item.Status === "rejected"
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
          contentHtml,
          printWindow
        );
        toast.dismiss("prestasi-dl");
        toast.success("Berhasil mencetak Laporan Prestasi!");
      } else {
        printWindow.close();
        toast.dismiss("prestasi-dl");
        toast.error("Gagal memuat data prestasi");
      }
    } catch (err) {
      printWindow.close();
      toast.dismiss("prestasi-dl");
      toast.error("Terjadi kesalahan sistem saat memproses PDF");
    }
  };

  const downloadBeasiswaPDF = async () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Gagal membuka jendela cetak. Pastikan pop-up browser tidak diblokir.");
      return;
    }
    printWindow.document.write("<html><body><p style='font-family:sans-serif; text-align:center; margin-top:20%; color:#64748b;'>Menyiapkan dokumen Laporan Beasiswa...</p></body></html>");

    try {
      toast.loading("Menyiapkan dokumen Laporan Beasiswa...", { id: "beasiswa-dl" });
      const res = await api.get(`${API}/scholarships`);
      if (res.data.status === "success") {
        const list = (res.data.data || []).map(b => ({
          ...b,
          Nama: b.nama || b.Nama,
          Penyelenggara: b.penyelenggara || b.Penyelenggara,
          Kuota: b.kuota !== undefined ? b.kuota : b.Kuota,
          Deskripsi: b.deskripsi || b.Deskripsi,
          IsActive: b.is_active !== undefined ? b.is_active : b.IsActive,
        }));
        if (list.length === 0) {
          printWindow.close();
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
          contentHtml,
          printWindow
        );
        toast.dismiss("beasiswa-dl");
        toast.success("Berhasil mencetak Laporan Beasiswa!");
      } else {
        printWindow.close();
        toast.dismiss("beasiswa-dl");
        toast.error("Gagal memuat data beasiswa");
      }
    } catch (err) {
      printWindow.close();
      toast.dismiss("beasiswa-dl");
      toast.error("Terjadi kesalahan sistem saat memproses PDF");
    }
  };

  const downloadKonselingPDF = async () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Gagal membuka jendela cetak. Pastikan pop-up browser tidak diblokir.");
      return;
    }
    printWindow.document.write("<html><body><p style='font-family:sans-serif; text-align:center; margin-top:20%; color:#64748b;'>Menyiapkan dokumen Laporan Konseling...</p></body></html>");

    try {
      toast.loading("Menyiapkan dokumen Laporan Konseling...", { id: "konseling-dl" });
      const res = await api.get(`${API}/counseling`);
      if (res.data.status === "success") {
        const list = (res.data.data || []).map(item => {
          const m = item.mahasiswa || item.Mahasiswa || {};
          const p = item.psikolog || item.Psikolog || {};
          return {
            ...item,
            Mahasiswa: { ...m, Nama: m.nama || m.Nama, NIM: m.nim || m.NIM },
            Psikolog: { ...p, Nama: p.nama || p.Nama },
            Tanggal: item.tanggal || item.Tanggal,
            Keluhan: item.keluhan || item.Keluhan,
            Status: item.status || item.Status,
          };
        });
        if (list.length === 0) {
          printWindow.close();
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
              <td>${item.Psikolog?.Nama || "—"}</td>
              <td>${item.Tanggal ? new Date(item.Tanggal).toLocaleDateString('id-ID') : "—"}</td>
              <td>${item.Keluhan || "—"}</td>
              <td style="font-weight: 700; color: #00236F;">${item.Status || "—"}</td>
            </tr>`;
        });

        const contentHtml = `
          <h3>Rekapitulasi Layanan Sesi Konseling &amp; Bimbingan</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 5%;">No</th>
                <th style="width: 25%;">Mahasiswa</th>
                <th style="width: 20%;">Psikolog / Konselor</th>
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
          "Dataset Sesi Bimbingan, Konseling, Dan Layanan Psikologis Mahasiswa Fakultas",
          contentHtml,
          printWindow
        );
        toast.dismiss("konseling-dl");
        toast.success("Berhasil mencetak Laporan Konseling!");
      } else {
        printWindow.close();
        toast.dismiss("konseling-dl");
        toast.error("Gagal memuat data konseling");
      }
    } catch (err) {
      printWindow.close();
      toast.dismiss("konseling-dl");
      toast.error("Terjadi kesalahan sistem saat memproses PDF");
    }
  };

  useEffect(() => { setMounted(true); fetchData() }, [])

  const prodiWithColors = (data.perProdi || []).map((item, i) => ({ ...item, nama_prodi: item.nama_prodi || "Unknown", value: item.value || 0, color: CHART_COLORS[i % CHART_COLORS.length] }))

  const prodiColumns = [
    {
      key: "nama_prodi",
      label: "Program Studi",
      render: (val) => <span className="font-semibold text-[var(--theme-text)] font-headline tracking-tight text-[14px]">{val}</span>
    },
    {
      key: "active",
      label: "Mahasiswa Aktif",
      render: (val) => <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">{val || 0}</span>
    },
    {
      key: "graduated",
      label: "Lulusan",
      render: (val) => <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">{val || 0}</span>
    },
    {
      key: "avgIPK",
      label: "Rata-rata IPK",
      render: (val) => <span className="font-black text-sm text-[var(--theme-text)] tabular-nums">{val?.toFixed(2) || '0.00'}</span>
    }
  ]

  return (
    <PageContent>
      <Toaster position="top-right" />

      <DashboardHero
        title="Laporan"
        highlightedTitle="Fakultas"
        subtitle="Dashboard analitik performa akademik dan layanan kemahasiswaan."
        icon="analytics"
        badges={[
          { label: 'Monitoring Strategis', active: false },
          { label: `${data.summary.total} Mahasiswa Terdaftar`, active: true },
        ]}
        actions={
          <>
            <button onClick={exportProdiPDF} className="h-10 px-4 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-sm text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-primary hover:border-primary/30 hover:bg-slate-50/50 shadow-sm transition-all duration-200 active:scale-95 flex items-center gap-2">
              <Download size={13} className="text-primary" /> Ekspor PDF
            </button>
            <button onClick={fetchData} disabled={loading} className="h-10 px-4 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-sm text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-primary hover:border-primary/30 hover:bg-slate-50/50 shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-60 flex items-center gap-2">
              {loading ? <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '13px' }} >sync</span> : <RefreshCw size={13} className="text-primary" />} Refresh Data
            </button>
          </>
        }
      />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-5 mb-6 mt-6">
          <PrimaryStatsCard
            title="Total Mahasiswa"
            value={loading ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>sync</span> : data.summary.total}
            icon={Users}
            colorTheme="primary"
          />
          <PrimaryStatsCard
            title="Capaian Prestasi"
            value={loading ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>sync</span> : data.summary.totalPrestasi}
            icon={Award}
            colorTheme="success"
          />
          <PrimaryStatsCard
            title="Penerima Beasiswa"
            value={loading ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>sync</span> : data.summary.totalBeasiswa}
            icon={Globe}
            colorTheme="info"
          />
          <PrimaryStatsCard
            title="Layanan Konseling"
            value={loading ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>sync</span> : (data.summary.totalKonseling || 0)}
            icon={Psychology}
            colorTheme="warning"
          />
          <PrimaryStatsCard
            title="Rata-rata IPK"
            value={loading ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>sync</span> : (data.summary.avgIPK ? data.summary.avgIPK.toFixed(2) : "0.00")}
            icon={HeartPulse}
            colorTheme="error"
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all duration-300">
            <h3 className="font-bold text-base font-headline mb-1 text-[var(--theme-h3)]">Status per Angkatan</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-5">Distribusi akademik tiap tahun angkatan</p>
            <div className="h-64">
              {isMounted && (
                <ResponsiveContainer width="99%" height="100%" debounce={50}>
                  <BarChart data={data.perAngkatan} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--theme-border)" />
                    <XAxis dataKey="angkatan" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,.1)', fontSize: '11px', fontWeight: 'bold' }} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="aktif" name="Aktif" fill="var(--theme-primary)" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="lulus" name="Lulus" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all duration-300">
            <h3 className="font-bold text-base font-headline mb-1 text-[var(--theme-h3)]">Distribusi Prodi</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-5">Persentase jumlah mahasiswa per prodi</p>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="h-56 flex-1 min-w-0">
                {isMounted && (
                  <ResponsiveContainer width="99%" height="100%" debounce={50}>
                    <PieChart>
                      <Pie data={prodiWithColors} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
                        {prodiWithColors.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,.1)', fontSize: '11px', fontWeight: 'bold' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="flex flex-col gap-2.5 min-w-[130px]">
                {prodiWithColors.map((p, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                    <div>
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight truncate max-w-[110px]">{p.nama_prodi}</p>
                      <p className="text-[9px] text-slate-400 font-bold">{p.value} Mahasiswa</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {[
            { label: 'Laporan Prestasi', icon: Award, bg: 'bg-emerald-600', light: 'bg-emerald-50', stat: `${data.summary.totalPrestasi} Capaian`, desc: 'Dataset kompetisi & penghargaan mahasiswa.', handler: downloadPrestasiPDF },
            { label: 'Laporan Beasiswa', icon: Globe, bg: 'bg-indigo-600', light: 'bg-indigo-50', stat: `${data.summary.totalBeasiswa} Penerima`, desc: 'Transkrip penerima bantuan finansial.', handler: downloadBeasiswaPDF },
            { label: 'Laporan Konseling', icon: Psychology, bg: 'bg-rose-600', light: 'bg-rose-50', stat: `${data.summary.totalKonseling || 0} Sesi`, desc: 'Monitoring layanan bimbingan & kesehatan psikologis.', handler: downloadKonselingPDF },
          ].map((item, i) => (
            <div key={i} className="glass-card border border-slate-200/60 rounded-2xl p-5 shadow-none hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-5">
                <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg', item.bg)}><item.icon size={20} /></div>
                <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">SEM-II 2024</span>
              </div>
              <h4 className="text-base font-extrabold font-headline mb-1" style={{ color: 'var(--theme-h4)' }}>{item.label}</h4>
              <p className="text-xs text-slate-400 mb-5 leading-relaxed">{item.desc}</p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Data</p>
                  <p className="text-sm font-black text-slate-900 tabular-nums">{item.stat}</p>
                </div>
                <button onClick={item.handler} className="w-10 h-10 rounded-xl bg-[#171717] text-white flex items-center justify-center hover:bg-primary transition-colors active:scale-95"><Download size={15} /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Per-Prodi Table */}
        <Card className="glass-card shadow-sm rounded-xl overflow-hidden mt-6 mb-6">
          <div className="px-6 py-5 border-b border-[var(--theme-border)] flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[var(--theme-surface)]">
            <div className="flex-1">
              <h2 className="font-headline font-bold text-lg text-[var(--theme-text)]">Rekap Per Program Studi</h2>
              <p className="text-xs text-[var(--theme-text-muted)] mt-1 font-medium">Data akademik terbaru tiap prodi</p>
            </div>
          </div>
          <CardContent className="p-0">
            <DataTable
              columns={prodiColumns}
              data={data.perProdi || []}
              loading={loading}
              searchPlaceholder="Cari program studi..."
              itemLabel="program studi"
            />
          </CardContent>
        </Card>
    </PageContent>
  )
}

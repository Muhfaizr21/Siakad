import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { insuranceService } from '../../services/api';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PageContent } from '@/components/ui/page'
import { DashboardHero } from '@/components/ui/dashboard'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { DataTable } from '@/components/ui/DataTable';
import { Eye, Download } from 'lucide-react';

// Auto-injected Material Symbol fallbacks
const InsuranceIcon = ({ size, className, ...props }) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>health_and_safety</span>
);
const CheckCircle = ({ size, className, ...props }) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>check_circle</span>
);
const CancelIcon = ({ size, className, ...props }) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>cancel</span>
);
const SearchIcon = ({ size, className, ...props }) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>search</span>
);
const DownloadIcon = ({ size, className, ...props }) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>download</span>
);

// Provider options
const PROVIDER_OPTIONS = [
  { value: '', label: 'Semua Provider' },
  { value: 'BKU_Assurance', label: 'BKU Assurance' },
  { value: 'BPJS', label: 'BPJS Kesehatan' },
  { value: 'Asuransi_Lain', label: 'Asuransi Lain' },
];

// Status options
const STATUS_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: 'PENDING_VERIFICATION', label: 'Menunggu' },
  { value: 'APPROVED_TK', label: 'Disetujui TK' },
  { value: 'APPROVED_FINAL', label: 'Final Approved' },
  { value: 'REJECTED', label: 'Ditolak' },
];

// Status badge
const StatusBadge = ({ status }) => {
  const config = {
    'PENDING_VERIFICATION': { label: 'Menunggu', bg: 'bg-[var(--theme-warning-light)]', text: 'text-[var(--theme-warning)]', border: 'border-[var(--theme-warning-light)]' },
    'APPROVED_TK': { label: 'Disetujui TK', bg: 'bg-[var(--theme-info-light)]', text: 'text-[var(--theme-info)]', border: 'border-[var(--theme-info-light)]' },
    'APPROVED_FINAL': { label: 'Final Approved', bg: 'bg-[var(--theme-success-light)]', text: 'text-[var(--theme-success)]', border: 'border-[var(--theme-success-light)]' },
    'REJECTED': { label: 'Ditolak', bg: 'bg-[var(--theme-error-light)]', text: 'text-[var(--theme-error)]', border: 'border-[var(--theme-error-light)]' },
  };
  const c = config[status] || config['PENDING_VERIFICATION'];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      {c.label}
    </span>
  );
};

// Provider badge
const ProviderBadge = ({ provider }) => {
  const config = {
    'BKU_Assurance': { label: 'BKU', color: 'bg-[var(--theme-primary)] text-white' },
    'BPJS': { label: 'BPJS', color: 'bg-[var(--theme-info)] text-white' },
    'Asuransi_Lain': { label: 'Lain', color: 'bg-[var(--theme-secondary)] text-[var(--theme-text)]' },
  };
  const badge = config[provider] || config['Asuransi_Lain'];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${badge.color}`}>
      {badge.label}
    </span>
  );
};

export default function InsuranceManagement() {
  const [claims, setClaims] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Fetch claims
  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await insuranceService.getClaims();
      if (res.status === 'success') {
        setClaims(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching claims:', err);
      toast.error('Gagal memuat data klaim');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const res = await insuranceService.getClaimStats();
      if (res.status === 'success') {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    fetchClaims();
    fetchStats();
  }, []);

  // Open detail modal
  const handleOpenDetail = (claim) => {
    setSelectedClaim(claim);
    setIsModalOpen(true);
  };

  // Update status
  const handleUpdateStatus = async (newStatus, catatan = '') => {
    if (!selectedClaim) return;

    setProcessing(true);
    try {
      const res = await insuranceService.updateClaimStatus(selectedClaim.id, {
        status: newStatus,
        catatan_review: catatan,
      });

      if (res.status === 'success') {
        toast.success(`Klaim berhasil diperbarui ke status: ${newStatus}`);
        setIsModalOpen(false);
        fetchClaims();
        fetchStats();
      }
    } catch (err) {
      toast.error(err.message || 'Gagal update status');
    } finally {
      setProcessing(false);
    }
  };

  // Download PDF
  const handleDownloadPDF = async (id) => {
    try {
      const response = await insuranceService.downloadClaimPDF(id);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `surat_pengantar_klaim_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF berhasil didownload');
    } catch (err) {
      toast.error('Gagal download PDF');
    }
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '—';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  // Total estimated amount
  const totalEstimasi = useMemo(() => {
    return claims.reduce((sum, c) => sum + (c.estimasi_biaya || 0), 0)
  }, [claims])

  // Status distribution chart
  const statusDistData = useMemo(() => {
    const counts = {}
    claims.forEach(c => {
      const s = c.status || 'PENDING_VERIFICATION'
      counts[s] = (counts[s] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [claims])

  // Monthly trend chart
  const monthlyTrendData = useMemo(() => {
    const byMonth = {}
    claims.forEach(c => {
      const d = c.tanggal_kejadian || c.created_at
      if (!d) return
      const date = new Date(d)
      if (isNaN(date.getTime())) return
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      byMonth[key] = (byMonth[key] || 0) + 1
    })
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']
    return Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).map(([m, v]) => {
      const [y, mo] = m.split('-')
      return { month: `${months[parseInt(mo) - 1]} ${y}`, value: v }
    })
  }, [claims])

  // Provider amount chart
  const providerAmountData = useMemo(() => {
    if (!stats?.by_provider) return []
    return stats.by_provider.map(p => ({ name: p.provider, value: p.total }))
  }, [stats])

  const PIE_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444']

  return (
    <PageContent>
      <DashboardHero
        title="Manajemen"
        highlightedTitle="Asuransi"
        subtitle="Kelola seluruh pengajuan klaim asuransi mahasiswa."
        icon="health_and_safety"
        badges={[{ label: 'Asuransi Mahasiswa', active: false }]}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Pengajuan</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{stats?.summary?.total_pengajuan || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-amber-200 bg-amber-50">
          <p className="text-xs font-bold text-amber-500 uppercase tracking-widest">Menunggu</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{stats?.summary?.pending || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-blue-200 bg-blue-50">
          <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">Approved TK</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{stats?.summary?.approved_tk || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-emerald-200 bg-emerald-50">
          <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Final Approved</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{stats?.summary?.approved_final || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-teal-200 bg-teal-50">
          <p className="text-xs font-bold text-teal-500 uppercase tracking-widest">Total Nilai Klaim</p>
          <p className="text-2xl font-bold text-teal-700 mt-1">{formatCurrency(totalEstimasi)}</p>
        </div>
      </div>

      {/* Charts */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Pie: Status Klaim */}
          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>pie_chart</span>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Klaim</span>
            </div>
            <div className="h-[170px] w-full flex items-center justify-center">
              {statusDistData.length > 0 ? (
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie data={statusDistData} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={3} dataKey="value" stroke="none">
                      {statusDistData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : <span className="text-xs text-slate-400 italic">Tidak ada data</span>}
            </div>
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              {statusDistData.slice(0, 4).map((item, i) => (
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

          {/* Bar: Klaim per Provider */}
          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>bar_chart</span>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nilai per Provider</span>
            </div>
            <div className="h-[170px] w-full">
              {providerAmountData.length > 0 ? (
                <ResponsiveContainer width="100%" height={170}>
                  <BarChart data={providerAmountData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 8, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Bar dataKey="value" name="Total" fill="#10b981" radius={[0, 4, 4, 0]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center"><span className="text-xs text-slate-400 italic">Tidak ada data</span></div>}
            </div>
          </div>

          {/* Line: Tren Pengajuan */}
          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>trending_up</span>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tren Pengajuan</span>
            </div>
            <div className="h-[170px] w-full">
              {monthlyTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={170}>
                  <LineChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 8, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" name="Klaim" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: '#f59e0b', r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center"><span className="text-xs text-slate-400 italic">Tidak ada data</span></div>}
            </div>
          </div>
        </div>
      )}



      {/* Claims Table */}
      <DataTable
        searchable={true}
        searchPlaceholder="Cari ID, Mahasiswa, NIM..."
        filters={[
          { key: 'jenis_provider', placeholder: 'Provider', options: PROVIDER_OPTIONS },
          { key: 'status', placeholder: 'Status', options: STATUS_OPTIONS }
        ]}
        onSearch={(data, search) => data.filter(row =>
          String(row.id).includes(search) ||
          (row.mahasiswa?.nama || '').toLowerCase().includes(search.toLowerCase()) ||
          (row.mahasiswa?.nim || '').toLowerCase().includes(search.toLowerCase())
        )}
        data={claims}
        loading={loading}
        columns={[
          {
            label: 'ID',
            key: 'id',
            render: (_, row) => <span className="text-xs font-mono text-slate-500">#{row.id}</span>
          },
          {
            label: 'Mahasiswa',
            key: 'mahasiswa',
            render: (_, row) => (
              <div>
                <p className="font-semibold text-[var(--theme-text)] text-sm">{row.mahasiswa?.nama || '—'}</p>
                <p className="text-xs text-[var(--theme-text-subtle)]">{row.mahasiswa?.nim || '—'}</p>
              </div>
            )
          },
          {
            label: 'Provider',
            key: 'jenis_provider',
            render: (_, row) => <ProviderBadge provider={row.jenis_provider} />
          },
          {
            label: 'Tanggal',
            key: 'tanggal_kejadian',
            render: (_, row) => <p className="text-sm font-medium text-[var(--theme-text-muted)]">{formatDate(row.tanggal_kejadian)}</p>
          },
          {
            label: 'Estimasi',
            key: 'estimasi_biaya',
            render: (_, row) => <p className="text-sm font-bold text-[var(--theme-primary)]">{formatCurrency(row.estimasi_biaya)}</p>
          },
          {
            label: 'Status',
            key: 'status',
            render: (_, row) => <StatusBadge status={row.status} />
          },
          {
            label: 'Aksi',
            key: 'actions',
            className: 'w-[100px] text-center',
            cellClassName: 'text-center',
            sortable: false,
            render: (_, row) => (
              <div className="flex justify-center items-center gap-1">
                <button
                  onClick={() => handleOpenDetail(row)}
                  title="Lihat Detail"
                  className="p-1.5 rounded-lg text-[var(--theme-primary)] hover:bg-[var(--theme-primary-light)] transition-colors flex items-center justify-center cursor-pointer"
                >
                  <Eye className="w-4 h-4" strokeWidth={2.5} />
                </button>
                {row.status === 'APPROVED_TK' && (
                  <button
                    onClick={() => handleDownloadPDF(row.id)}
                    title="Download PDF"
                    className="p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-bg)] transition-colors flex items-center justify-center cursor-pointer"
                  >
                    <Download className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                )}
              </div>
            )
          }
        ]}
      />

      {/* ── Global Insurance Claim Audit Dialog Popup Modal ───────────────── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen} maxWidth="max-w-5xl">
        {selectedClaim && (
          <DialogContent className="max-h-[90vh] overflow-y-auto flex flex-col p-0">
            {/* Modal Header */}
            <DialogHeader className="shrink-0 flex items-center justify-between flex-row bg-[var(--theme-surface)] border-b border-[var(--theme-border)] p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--theme-primary-light)] rounded-2xl flex items-center justify-center text-[var(--theme-primary)] shrink-0">
                  <InsuranceIcon size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">
                    <span>Insurance Claim Manager</span>
                    <span>·</span>
                    <span className="text-[var(--theme-secondary)]">#INS-{selectedClaim.id?.toString().padStart(4, '0')}</span>
                  </div>
                  <DialogTitle className="text-base font-bold font-headline leading-tight mt-0.5 text-[var(--theme-text)]">
                    Klaim Asuransi Mahasiswa
                  </DialogTitle>
                </div>
              </div>

              <div className="flex items-center gap-3 pr-4">
                <StatusBadge status={selectedClaim.status} />
              </div>
            </DialogHeader>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Left Column: Claimant Profile & Claim Details */}
              <div className="lg:col-span-3 space-y-6">

                {/* Claimant Profile Block */}
                <div className="p-6 rounded-2xl bg-[var(--theme-bg)] border border-[var(--theme-border)] shadow-none flex flex-col md:flex-row gap-5 items-start">
                  <div className="w-16 h-16 rounded-2xl shadow-md ring-4 ring-[var(--theme-border-muted)] shrink-0 flex items-center justify-center bg-[var(--theme-surface)] text-slate-400">
                    <span className="material-symbols-outlined text-[32px]">person</span>
                  </div>

                  <div className="flex-1 space-y-3 w-full">
                    <div className="flex items-center justify-between border-b border-[var(--theme-border-muted)] pb-2">
                      <span className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">Identitas Pengklaim</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[8px] font-bold border border-[var(--theme-border)] text-[var(--theme-text-muted)] bg-[var(--theme-bg)] uppercase tracking-wider">Verified Mahasiswa</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs text-[var(--theme-text)]">
                      <div>
                        <p className="text-[9px] font-semibold text-[var(--theme-text-subtle)] uppercase tracking-wider">Nama Lengkap</p>
                        <p className="font-bold truncate">{selectedClaim.mahasiswa?.nama || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-semibold text-[var(--theme-text-subtle)] uppercase tracking-wider">NIM / Identifier</p>
                        <p className="font-mono font-bold">{selectedClaim.mahasiswa?.nim || '—'}</p>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <p className="text-[9px] font-semibold text-[var(--theme-text-subtle)] uppercase tracking-wider">Fakultas</p>
                        <p className="font-bold truncate flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-[14px] text-[var(--theme-primary)]">business</span>
                          {selectedClaim.mahasiswa?.fakultas?.nama || '—'}
                        </p>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <p className="text-[9px] font-semibold text-[var(--theme-text-subtle)] uppercase tracking-wider">Program Studi</p>
                        <p className="font-bold truncate mt-0.5">{selectedClaim.mahasiswa?.program_studi?.nama || '—'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Substantive Content */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 text-[var(--theme-text-muted)]">
                    <span className="material-symbols-outlined text-[var(--theme-primary)] text-[16px]">health_and_safety</span> Detail Klaim Asuransi
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-[var(--theme-bg)] border border-[var(--theme-border)]">
                      <p className="text-[10px] font-semibold text-[var(--theme-text-subtle)] uppercase tracking-wider mb-2">Provider</p>
                      <ProviderBadge provider={selectedClaim.jenis_provider} />
                    </div>
                    <div className="p-5 rounded-2xl bg-[var(--theme-bg)] border border-[var(--theme-border)]">
                      <p className="text-[10px] font-semibold text-[var(--theme-text-subtle)] uppercase tracking-wider mb-2">Tanggal Kejadian</p>
                      <p className="font-bold text-sm text-[var(--theme-text)] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-slate-400">calendar_today</span>
                        {formatDate(selectedClaim.tanggal_kejadian)}
                      </p>
                    </div>
                    <div className="p-5 rounded-2xl bg-[var(--theme-bg)] border border-[var(--theme-border)]">
                      <p className="text-[10px] font-semibold text-[var(--theme-text-subtle)] uppercase tracking-wider mb-2">Lokasi Faskes</p>
                      <p className="font-bold text-sm text-[var(--theme-text)] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-slate-400">location_on</span>
                        {selectedClaim.lokasi_faskes || '—'}
                      </p>
                    </div>
                    <div className="p-5 rounded-2xl bg-[var(--theme-bg)] border border-[var(--theme-border)]">
                      <p className="text-[10px] font-semibold text-[var(--theme-text-subtle)] uppercase tracking-wider mb-2">Estimasi Biaya</p>
                      <p className="font-black text-lg text-[var(--theme-primary)]">{formatCurrency(selectedClaim.estimasi_biaya)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 text-[var(--theme-text-muted)]">
                    <span className="material-symbols-outlined text-[var(--theme-primary)] text-[16px]">description</span> Kronologis / Deskripsi
                  </h4>
                  <div className="p-6 rounded-2xl bg-[var(--theme-bg)] border border-[var(--theme-border)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <span className="material-symbols-outlined text-[80px]">history_edu</span>
                    </div>
                    <p className="text-sm text-[var(--theme-text-muted)] font-medium leading-relaxed font-body relative z-10 whitespace-pre-wrap">
                      {selectedClaim.deskripsi || 'Tidak ada deskripsi kejadian.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Action & Audit Trail Section */}
              <div className="lg:col-span-2 space-y-6 flex flex-col">
                <div className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] shadow-sm overflow-hidden flex flex-col flex-1">
                  <div className="p-5 border-b border-[var(--theme-border)] bg-[var(--theme-bg)]/50 backdrop-blur-md">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-text)] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-[var(--theme-primary)]">task_alt</span>
                      Resolution Control
                    </h3>
                  </div>

                  <div className="p-5 flex-1 flex flex-col gap-4">
                    {/* Status Alert */}
                    <div className="space-y-4">
                      {selectedClaim.status === 'APPROVED_TK' ? (
                        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                          <p className="text-xs text-emerald-700 font-semibold flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">verified</span>
                            Klaim telah disetujui provider. Finalisasi klaim dapat dilakukan.
                          </p>
                        </div>
                      ) : selectedClaim.status === 'APPROVED_FINAL' ? (
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                          <p className="text-xs text-slate-500 font-semibold flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">lock</span>
                            Klaim ini sudah mencapai status akhir (APPROVED_FINAL).
                          </p>
                        </div>
                      ) : selectedClaim.status === 'REJECTED' ? (
                        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl">
                          <p className="text-xs text-rose-600 font-semibold flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">cancel</span>
                            Klaim ini telah ditolak dan tidak dapat diproses lebih lanjut.
                          </p>
                        </div>
                      ) : (
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                          <p className="text-xs text-amber-700 font-semibold flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">info</span>
                            Klaim ini sedang dalam status {selectedClaim.status}.
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="space-y-3 mt-4">
                        {selectedClaim.status === 'APPROVED_TK' && (
                          <button
                            onClick={() => handleUpdateStatus('APPROVED_FINAL')}
                            disabled={processing}
                            className="w-full h-11 flex items-center justify-center gap-2 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer text-xs uppercase tracking-wider shadow-md"
                          >
                            <CheckCircle size={16} />
                            Approve Final
                          </button>
                        )}
                        {selectedClaim.status !== 'REJECTED' && selectedClaim.status !== 'APPROVED_FINAL' && (
                          <button
                            onClick={() => handleUpdateStatus('REJECTED')}
                            disabled={processing}
                            className="w-full h-11 flex items-center justify-center gap-2 text-rose-600 border border-rose-200 hover:bg-rose-50 font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer text-xs uppercase tracking-wider"
                          >
                            <CancelIcon size={16} />
                            Tolak Klaim
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Review Notes Box */}
                    {selectedClaim.catatan_review && (
                      <div className="mt-4 border-t border-[var(--theme-border-muted)] pt-4">
                        <p className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Catatan Review</p>
                        <div className="bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl p-4 relative">
                          <span className="material-symbols-outlined absolute top-3 right-3 text-slate-200 text-3xl">format_quote</span>
                          <p className="text-xs text-[var(--theme-text)] font-medium leading-relaxed italic relative z-10">
                            "{selectedClaim.catatan_review}"
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </PageContent>
  );
}
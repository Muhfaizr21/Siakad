import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { insuranceService } from '../../services/api';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PageContent } from '@/components/ui/page'
import { DashboardHero } from '@/components/ui/dashboard'
import { DialogModal, ModalCancelButton } from '@/components/ui/DialogModal';
import { DataTable } from '@/components/ui/DataTable';
import { PrimaryStatsCard } from '@/components/ui/StatsCard';
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
    try {
      setLoading(true);
      const res = await insuranceService.getClaims();
      setClaims(res.data || []);
    } catch (error) {
      toast.error('Gagal memuat data klaim');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const res = await insuranceService.getClaimStats();
      setStats(res.data);
    } catch (error) {
      console.error('Gagal memuat statistik klaim', error);
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
    
    const labelMap = {
      'PENDING_VERIFICATION': 'Menunggu',
      'APPROVED_TK': 'Approved TK',
      'APPROVED_FINAL': 'Final Approved',
      'REJECTED': 'Ditolak'
    }
    const colorMap = {
      'PENDING_VERIFICATION': '#f59e0b', // amber
      'APPROVED_TK': '#3b82f6', // blue
      'APPROVED_FINAL': '#10b981', // emerald
      'REJECTED': '#ef4444' // rose
    }

    return Object.entries(counts).map(([name, value]) => ({ 
      name: labelMap[name] || name, 
      value,
      color: colorMap[name] || '#94a3b8' 
    }))
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
      return { month: `${months[parseInt(mo) - 1]} ${y}`, shortMonth: months[parseInt(mo) - 1], value: v }
    })
  }, [claims])

  // Provider amount chart
  const providerAmountData = useMemo(() => {
    if (!stats?.by_provider) return []
    return stats.by_provider.map(p => ({ 
      name: p.provider.replace('_', ' '), 
      value: p.total 
    }))
  }, [stats])

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
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
        <PrimaryStatsCard
          title="Total Pengajuan"
          value={stats?.summary?.total_pengajuan || 0}
          icon="folder_open"
          colorTheme="primary"
        />
        <PrimaryStatsCard
          title="Menunggu"
          value={stats?.summary?.pending || 0}
          icon="hourglass_empty"
          colorTheme="warning"
        />
        <PrimaryStatsCard
          title="Approved TK"
          value={stats?.summary?.approved_tk || 0}
          icon="thumb_up"
          colorTheme="info"
        />
        <PrimaryStatsCard
          title="Final Approved"
          value={stats?.summary?.approved_final || 0}
          icon="verified"
          colorTheme="success"
        />
        <PrimaryStatsCard
          title="Total Nilai Klaim"
          value={formatCurrency(totalEstimasi)}
          icon="payments"
          colorTheme="primary"
        />
      </div>

      {/* Charts */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Pie: Status Klaim */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>pie_chart</span>
              </div>
              <span className="text-[11px] font-bold text-[var(--theme-text-muted)] uppercase tracking-widest">Status Klaim</span>
            </div>
            <div className="h-[180px] w-full flex items-center justify-center">
              {statusDistData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={statusDistData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value" stroke="none">
                      {statusDistData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : <span className="text-xs text-slate-400 italic">Tidak ada data</span>}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {statusDistData.slice(0, 4).map((item) => (
                <div key={item.name} className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                  <div className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: item.color }} />
                  <div className="min-w-0">
                    <p className="text-[9px] font-black text-slate-500 truncate uppercase tracking-wider">{item.name}</p>
                    <p className="text-sm font-extrabold text-slate-800 leading-none mt-1">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bar: Klaim per Provider */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-4 shrink-0">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>bar_chart</span>
              </div>
              <span className="text-[11px] font-bold text-[var(--theme-text-muted)] uppercase tracking-widest">Nilai per Provider</span>
            </div>
            <div className="flex-1 w-full min-h-0">
              {providerAmountData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={providerAmountData} margin={{ top: 15, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 700, fill: '#475569' }} axisLine={false} tickLine={false} />
                    <YAxis type="number" tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(0)} Jt` : v} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} width={45} />
                    <Tooltip 
                      formatter={(v) => formatCurrency(v)} 
                      cursor={{ fill: 'transparent' }} 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontSize: '12px', fontWeight: 'bold' }} 
                    />
                    <Bar dataKey="value" name="Total" radius={[6, 6, 0, 0]} barSize={36}>
                      {providerAmountData.map((entry, index) => {
                        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center"><span className="text-xs text-slate-400 italic">Tidak ada data</span></div>}
            </div>
          </div>

          {/* Area: Tren Pengajuan */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-4 shrink-0">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>trending_up</span>
              </div>
              <span className="text-[11px] font-bold text-[var(--theme-text-muted)] uppercase tracking-widest">Tren Pengajuan</span>
            </div>
            <div className="flex-1 w-full min-h-0">
              {monthlyTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="shortMonth" padding={{ left: 10, right: 10 }} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{ stroke: '#e2e8f0', strokeWidth: 2, strokeDasharray: '3 3' }} 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontSize: '12px', fontWeight: 'bold' }} 
                      labelFormatter={(label) => {
                        const item = monthlyTrendData.find(d => d.shortMonth === label);
                        return item ? item.month : label;
                      }}
                    />
                    <Area type="monotone" dataKey="value" name="Klaim" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" activeDot={{ r: 5, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }} />
                  </AreaChart>
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
      <DialogModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        icon="admin_panel_settings"
        title="Detail Klaim Asuransi"
        subtitle={selectedClaim ? `Insurance Claim Manager · #INS-${selectedClaim.id?.toString().padStart(4, '0')}` : 'Memuat data...'}
        maxWidth="max-w-3xl"
        footer={<ModalCancelButton onClick={() => setIsModalOpen(false)}>Tutup Detail</ModalCancelButton>}
      >
        {selectedClaim && (
          <div className="space-y-8">
            {/* ── Status Banner ── */}
            <div className="flex items-center justify-between bg-slate-50/80 border border-slate-200/60 p-4 rounded-2xl">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status Klaim</span>
              <StatusBadge status={selectedClaim.status} />
            </div>

            {/* ── Claimant Profile ── */}
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-[var(--theme-text-muted)] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[var(--theme-primary)]">person</span>
                Identitas Pengklaim
              </h4>
              <div className="p-5 rounded-2xl bg-white border border-slate-200/60 flex flex-col md:flex-row gap-5 items-start">
                <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 shrink-0 flex items-center justify-center text-slate-400">
                  <span className="material-symbols-outlined text-[28px]">person</span>
                </div>
                <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Nama Lengkap</p>
                    <p className="font-bold text-[var(--theme-text)] truncate">{selectedClaim.mahasiswa?.nama || '—'}</p>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1">NIM</p>
                    <p className="font-mono font-bold text-[var(--theme-text)]">{selectedClaim.mahasiswa?.nim || '—'}</p>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Fakultas</p>
                    <p className="font-bold text-[var(--theme-text)] truncate">{selectedClaim.mahasiswa?.fakultas?.nama || '—'}</p>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Program Studi</p>
                    <p className="font-bold text-[var(--theme-text)] truncate">{selectedClaim.mahasiswa?.program_studi?.nama || '—'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Claim Details Grid ── */}
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-[var(--theme-text-muted)] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[var(--theme-primary)]">health_and_safety</span>
                Detail Asuransi
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-200/60">
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Provider</p>
                  <ProviderBadge provider={selectedClaim.jenis_provider} />
                </div>
                <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-200/60">
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Tanggal Kejadian</p>
                  <p className="font-bold text-xs text-[var(--theme-text)]">{formatDate(selectedClaim.tanggal_kejadian)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-200/60">
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Lokasi Faskes</p>
                  <p className="font-bold text-xs text-[var(--theme-text)] truncate">{selectedClaim.lokasi_faskes || '—'}</p>
                </div>
                <div className="p-4 rounded-2xl bg-[var(--theme-primary-light)] border border-[var(--theme-primary)]/10">
                  <p className="text-[9px] font-semibold text-[var(--theme-primary)]/60 uppercase tracking-wider mb-2">Estimasi Biaya</p>
                  <p className="font-black text-sm text-[var(--theme-primary)]">{formatCurrency(selectedClaim.estimasi_biaya)}</p>
                </div>
              </div>
            </div>

            {/* ── Chronology ── */}
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-[var(--theme-text-muted)] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[var(--theme-primary)]">description</span>
                Kronologis / Deskripsi
              </h4>
              <div className="p-5 rounded-2xl bg-white border border-slate-200/60 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                  <span className="material-symbols-outlined text-[64px]">history_edu</span>
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed whitespace-pre-wrap relative z-10">
                  {selectedClaim.deskripsi || 'Tidak ada deskripsi kejadian.'}
                </p>
              </div>
            </div>

            {/* ── Resolution Control ── */}
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-[var(--theme-text-muted)] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[var(--theme-primary)]">task_alt</span>
                Tindakan & Review
              </h4>
              <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-4">
                {/* Status Message */}
                {selectedClaim.status === 'APPROVED_TK' ? (
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-start gap-3">
                    <span className="material-symbols-outlined text-emerald-600 text-[20px]">verified</span>
                    <div>
                      <p className="text-xs font-bold text-emerald-800">Menunggu Finalisasi</p>
                      <p className="text-[11px] text-emerald-600 mt-0.5">Klaim telah disetujui provider tahap 1. Finalisasi klaim sekarang dapat dilakukan.</p>
                    </div>
                  </div>
                ) : selectedClaim.status === 'APPROVED_FINAL' ? (
                  <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl flex items-start gap-3">
                    <span className="material-symbols-outlined text-slate-400 text-[20px]">lock</span>
                    <div>
                      <p className="text-xs font-bold text-slate-700">Klaim Selesai</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Klaim ini sudah disetujui sepenuhnya dan berstatus final.</p>
                    </div>
                  </div>
                ) : selectedClaim.status === 'REJECTED' ? (
                  <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-start gap-3">
                    <span className="material-symbols-outlined text-rose-600 text-[20px]">cancel</span>
                    <div>
                      <p className="text-xs font-bold text-rose-800">Klaim Ditolak</p>
                      <p className="text-[11px] text-rose-600 mt-0.5">Klaim ini telah ditolak secara permanen dan tidak dapat diproses lagi.</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-start gap-3">
                    <span className="material-symbols-outlined text-amber-600 text-[20px]">pending_actions</span>
                    <div>
                      <p className="text-xs font-bold text-amber-800">Menunggu Provider</p>
                      <p className="text-[11px] text-amber-600 mt-0.5">Klaim saat ini berstatus {selectedClaim.status}. Menunggu aksi selanjutnya.</p>
                    </div>
                  </div>
                )}

                {/* Review Notes */}
                {selectedClaim.catatan_review && (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Catatan Review Terakhir</p>
                    <p className="text-xs text-slate-700 italic">"{selectedClaim.catatan_review}"</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  {selectedClaim.status === 'APPROVED_TK' && (
                    <button
                      onClick={() => handleUpdateStatus('APPROVED_FINAL')}
                      disabled={processing}
                      className="flex-1 h-10 flex items-center justify-center gap-2 bg-[var(--theme-primary)] hover:opacity-90 text-white font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 text-xs uppercase tracking-wider shadow-md border-none cursor-pointer"
                    >
                      <CheckCircle size={16} /> Approve Final
                    </button>
                  )}
                  {selectedClaim.status !== 'REJECTED' && selectedClaim.status !== 'APPROVED_FINAL' && (
                    <button
                      onClick={() => handleUpdateStatus('REJECTED')}
                      disabled={processing}
                      className="flex-1 h-10 flex items-center justify-center gap-2 bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 text-xs uppercase tracking-wider cursor-pointer"
                    >
                      <CancelIcon size={16} /> Tolak Klaim
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogModal>
    </PageContent>
  );
}
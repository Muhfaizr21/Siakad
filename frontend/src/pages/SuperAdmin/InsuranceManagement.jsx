import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { insuranceService } from '../../services/api';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PageContent } from '@/components/ui/page'
import { DashboardHero } from '@/components/ui/dashboard'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';

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

  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [filterProvider, setFilterProvider] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch claims
  const fetchClaims = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterProvider) params.jenis_provider = filterProvider;

      const res = await insuranceService.getClaims(params);
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
  }, [filterStatus, filterProvider]);

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
      const key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`
      byMonth[key] = (byMonth[key] || 0) + 1
    })
    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des']
    return Object.entries(byMonth).sort(([a],[b]) => a.localeCompare(b)).map(([m, v]) => {
      const [y, mo] = m.split('-')
      return { month: `${months[parseInt(mo)-1]} ${y}`, value: v }
    })
  }, [claims])

  // Provider amount chart
  const providerAmountData = useMemo(() => {
    if (!stats?.by_provider) return []
    return stats.by_provider.map(p => ({ name: p.provider, value: p.total }))
  }, [stats])

  const PIE_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444']

  // Filter by search
  const filteredClaims = claims.filter(claim => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      claim.mahasiswa?.nama?.toLowerCase().includes(query) ||
      claim.mahasiswa?.nim?.toLowerCase().includes(query) ||
      claim.deskripsi?.toLowerCase().includes(query)
    );
  });

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

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama/NIM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
            />
          </div>

          <div className="relative">
            <select
              value={filterProvider}
              onChange={(e) => setFilterProvider(e.target.value)}
              className="appearance-none pl-3 pr-10 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none bg-white cursor-pointer"
            >
              {PROVIDER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-base">expand_more</span>
          </div>

          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none pl-3 pr-10 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none bg-white cursor-pointer"
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-base">expand_more</span>
          </div>
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Mahasiswa</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Provider</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Estimasi</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-8"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                  </tr>
                ))
              ) : filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    <span className="material-symbols-outlined text-4xl text-slate-300">inbox</span>
                    <p className="mt-2">Tidak ada pengajuan klaim</p>
                  </td>
                </tr>
              ) : (
                filteredClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-slate-500">#{claim.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{claim.mahasiswa?.nama || '—'}</p>
                        <p className="text-xs text-slate-500">{claim.mahasiswa?.nim || '—'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ProviderBadge provider={claim.jenis_provider} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-700">{formatDate(claim.tanggal_kejadian)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-teal-600">{formatCurrency(claim.estimasi_biaya)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={claim.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenDetail(claim)}
                          className="px-3 py-1.5 bg-teal-500 text-white text-xs font-bold rounded-lg hover:bg-teal-600 transition-colors"
                        >
                          Detail
                        </button>
                        {claim.status === 'APPROVED_TK' && (
                          <button
                            onClick={() => handleDownloadPDF(claim.id)}
                            className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1"
                          >
                            <DownloadIcon size={14} />
                            PDF
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen} maxWidth="max-w-lg">
        {selectedClaim && (
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--theme-primary-light)] flex items-center justify-center text-[var(--theme-primary)]">
                  <InsuranceIcon size={20} />
                </div>
                <div>
                  <DialogTitle>Detail Klaim</DialogTitle>
                  <DialogDescription>ID: #{selectedClaim.id}</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="p-6 space-y-4 text-[var(--theme-text)]">
              <div className="bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-2xl p-4">
                <h3 className="text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Mahasiswa</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] text-[var(--theme-text-subtle)]">Nama</p>
                    <p className="font-semibold text-sm">{selectedClaim.mahasiswa?.nama || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--theme-text-subtle)]">NIM</p>
                    <p className="font-semibold text-sm">{selectedClaim.mahasiswa?.nim || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--theme-text-subtle)]">Prodi</p>
                    <p className="font-semibold text-sm">{selectedClaim.mahasiswa?.program_studi?.nama || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--theme-text-subtle)]">Fakultas</p>
                    <p className="font-semibold text-sm">{selectedClaim.mahasiswa?.fakultas?.nama || '—'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-2xl p-4">
                <h3 className="text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Detail Klaim</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--theme-text-muted)]">Provider</span>
                    <ProviderBadge provider={selectedClaim.jenis_provider} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--theme-text-muted)]">Tanggal</span>
                    <span className="text-sm font-semibold">{formatDate(selectedClaim.tanggal_kejadian)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--theme-text-muted)]">Lokasi</span>
                    <span className="text-sm font-semibold">{selectedClaim.lokasi_faskes || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--theme-text-muted)]">Estimasi</span>
                    <span className="text-sm font-bold text-[var(--theme-primary)]">{formatCurrency(selectedClaim.estimasi_biaya)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--theme-text-muted)]">Status</span>
                    <StatusBadge status={selectedClaim.status} />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Kronologis</h3>
                <p className="text-sm text-[var(--theme-text)] bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl p-3">{selectedClaim.deskripsi || '—'}</p>
              </div>

              {selectedClaim.catatan_review && (
                <div>
                  <h3 className="text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Catatan Review</h3>
                  <p className="text-sm text-[var(--theme-text)] bg-[var(--theme-info-light)] border border-[var(--theme-info-light)] rounded-xl p-3">{selectedClaim.catatan_review}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <DialogFooter className="flex flex-col gap-2 sm:flex-col sm:space-x-0">
              {selectedClaim.status === 'APPROVED_TK' && (
                <button
                  onClick={() => handleUpdateStatus('APPROVED_FINAL')}
                  disabled={processing}
                  className="w-full h-10 flex items-center justify-center gap-2 bg-[var(--theme-success)] hover:bg-[var(--theme-success)]/95 text-white font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer text-xs uppercase tracking-wider"
                >
                  <CheckCircle size={18} />
                  Approve Final
                </button>
              )}
              {selectedClaim.status !== 'REJECTED' && selectedClaim.status !== 'APPROVED_FINAL' && (
                <button
                  onClick={() => handleUpdateStatus('REJECTED')}
                  disabled={processing}
                  className="w-full h-10 flex items-center justify-center gap-2 bg-[var(--theme-error)] hover:bg-[var(--theme-error)]/95 text-white font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer text-xs uppercase tracking-wider"
                >
                  <CancelIcon size={18} />
                  Tolak Klaim
                </button>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </PageContent>
  );
}
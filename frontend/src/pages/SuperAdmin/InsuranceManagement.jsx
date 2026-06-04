import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { insuranceService } from '../../services/api';
import toast from 'react-hot-toast';

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
    'PENDING_VERIFICATION': { label: 'Menunggu', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
    'APPROVED_TK': { label: 'Disetujui TK', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
    'APPROVED_FINAL': { label: 'Final', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
    'REJECTED': { label: 'Ditolak', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  };
  const c = config[status] || config['PENDING_VERIFICATION'];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${c.bg} ${c.text} ${c.border}`}>
      {c.label}
    </span>
  );
};

// Provider badge
const ProviderBadge = ({ provider }) => {
  const config = {
    'BKU_Assurance': { label: 'BKU', color: 'bg-teal-500' },
    'BPJS': { label: 'BPJS', color: 'bg-blue-500' },
    'Asuransi_Lain': { label: 'Lain', color: 'bg-purple-500' },
  };
  const badge = config[provider] || config['Asuransi_Lain'];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold text-white ${badge.color}`}>
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-500 flex items-center justify-center">
            <InsuranceIcon size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Manajemen Asuransi</h1>
            <p className="text-sm text-slate-500">Kelola seluruh pengajuan klaim asuransi</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-2xl font-bold text-slate-800">{stats?.summary?.total_pengajuan || 0}</p>
          <p className="text-xs text-slate-500">Total Pengajuan</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-amber-200 bg-amber-50">
          <p className="text-2xl font-bold text-amber-700">{stats?.summary?.pending || 0}</p>
          <p className="text-xs text-amber-600">Menunggu</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-blue-200 bg-blue-50">
          <p className="text-2xl font-bold text-blue-700">{stats?.summary?.approved_tk || 0}</p>
          <p className="text-xs text-blue-600">Approved TK</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-emerald-200 bg-emerald-50">
          <p className="text-2xl font-bold text-emerald-700">
            {stats?.summary?.approved_final || 0}
          </p>
          <p className="text-xs text-emerald-600">Final Approved</p>
        </div>
      </div>

      {/* Provider Stats */}
      {stats?.by_provider && stats.by_provider.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <h3 className="text-sm font-bold text-slate-600 mb-3">Statistik per Provider</h3>
          <div className="grid grid-cols-3 gap-4">
            {stats.by_provider.map((item, idx) => (
              <div key={idx} className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <ProviderBadge provider={item.provider} />
                  <span className="text-lg font-bold text-slate-700">{item.count}</span>
                </div>
                <p className="text-xs text-slate-500">Total: {formatCurrency(item.total)}</p>
              </div>
            ))}
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

          <select
            value={filterProvider}
            onChange={(e) => setFilterProvider(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
          >
            {PROVIDER_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
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
      <AnimatePresence>
        {isModalOpen && selectedClaim && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                        <InsuranceIcon size={20} className="text-teal-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-800">Detail Klaim</h2>
                        <p className="text-xs text-slate-500">ID: #{selectedClaim.id}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Mahasiswa</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[10px] text-slate-400">Nama</p>
                        <p className="font-semibold text-sm">{selectedClaim.mahasiswa?.nama || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400">NIM</p>
                        <p className="font-semibold text-sm">{selectedClaim.mahasiswa?.nim || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400">Prodi</p>
                        <p className="font-semibold text-sm">{selectedClaim.mahasiswa?.program_studi?.nama || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400">Fakultas</p>
                        <p className="font-semibold text-sm">{selectedClaim.mahasiswa?.fakultas?.nama || '—'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Detail Klaim</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Provider</span>
                        <ProviderBadge provider={selectedClaim.jenis_provider} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Tanggal</span>
                        <span className="text-sm font-semibold">{formatDate(selectedClaim.tanggal_kejadian)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Lokasi</span>
                        <span className="text-sm font-semibold">{selectedClaim.lokasi_faskes || '—'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Estimasi</span>
                        <span className="text-sm font-bold text-teal-600">{formatCurrency(selectedClaim.estimasi_biaya)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Status</span>
                        <StatusBadge status={selectedClaim.status} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Kronologis</h3>
                    <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">{selectedClaim.deskripsi || '—'}</p>
                  </div>

                  {selectedClaim.catatan_review && (
                    <div>
                      <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Catatan Review</h3>
                      <p className="text-sm text-slate-700 bg-blue-50 rounded-lg p-3">{selectedClaim.catatan_review}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-slate-200 space-y-2">
                  {selectedClaim.status === 'APPROVED_TK' && (
                    <button
                      onClick={() => handleUpdateStatus('APPROVED_FINAL')}
                      disabled={processing}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle size={18} />
                      Approve Final
                    </button>
                  )}
                  {selectedClaim.status !== 'REJECTED' && selectedClaim.status !== 'APPROVED_FINAL' && (
                    <button
                      onClick={() => handleUpdateStatus('REJECTED')}
                      disabled={processing}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      <CancelIcon size={18} />
                      Tolak Klaim
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
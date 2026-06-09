import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { insuranceService } from '../../services/api';
import toast from 'react-hot-toast';
import { PageContent } from '@/components/ui/page';
import { DashboardHero } from '@/components/ui/dashboard';
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
const Clock = ({ size, className, ...props }) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>schedule</span>
);
const DownloadIcon = ({ size, className, ...props }) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>download</span>
);
const SearchIcon = ({ size, className, ...props }) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>search</span>
);
const FilterIcon = ({ size, className, ...props }) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>filter_list</span>
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

// Status badge component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    'PENDING_VERIFICATION': { label: 'Menunggu', bg: 'bg-[var(--theme-warning-light)]', text: 'text-[var(--theme-warning)]', border: 'border-[var(--theme-warning-light)]' },
    'APPROVED_TK': { label: 'Disetujui TK', bg: 'bg-[var(--theme-info-light)]', text: 'text-[var(--theme-info)]', border: 'border-[var(--theme-info-light)]' },
    'APPROVED_FINAL': { label: 'Final Approved', bg: 'bg-[var(--theme-success-light)]', text: 'text-[var(--theme-success)]', border: 'border-[var(--theme-success-light)]' },
    'REJECTED': { label: 'Ditolak', bg: 'bg-[var(--theme-error-light)]', text: 'text-[var(--theme-error)]', border: 'border-[var(--theme-error-light)]' },
  };

  const config = statusConfig[status] || statusConfig['PENDING_VERIFICATION'];

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
      {config.label}
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

export default function InsuranceReview() {
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

  // Update claim status
  const handleUpdateStatus = async (newStatus, catatan = '') => {
    if (!selectedClaim) return;

    setProcessing(true);
    try {
      const res = await insuranceService.updateClaimStatus(selectedClaim.id, {
        status: newStatus,
        catatan_review: catatan,
      });

      if (res.status === 'success') {
        toast.success(`Klaim berhasil ${newStatus === 'APPROVED_TK' ? 'disetujui' : 'ditolak'}`);
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
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
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
    <PageContent>
      <DashboardHero
        title="Review"
        highlightedTitle="Klaim Asuransi"
        subtitle="Verifikasi & approve pengajuan klaim mahasiswa"
        icon="health_and_safety"
        badges={[
          { label: 'Insurance Review', active: true },
        ]}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-600">description</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats?.summary?.total_pengajuan || 0}</p>
              <p className="text-xs text-slate-500">Total Pengajuan</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-amber-200 bg-amber-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-200 flex items-center justify-center">
              <Clock size={20} className="text-amber-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-700">{stats?.summary?.pending || 0}</p>
              <p className="text-xs text-amber-600">Menunggu</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-blue-200 bg-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
              <CheckCircle size={20} className="text-blue-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{stats?.summary?.approved_tk || 0}</p>
              <p className="text-xs text-blue-600">Approved TK</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-emerald-200 bg-emerald-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-200 flex items-center justify-center">
              <CheckCircle size={20} className="text-emerald-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-700">
                {(stats?.summary?.approved_final || 0) + (stats?.summary?.approved_tk || 0)}
              </p>
              <p className="text-xs text-emerald-600">Total Disetujui</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
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

          {/* Provider filter */}
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

          {/* Status filter */}
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
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Mahasiswa</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Provider</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Tanggal Kejadian</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Estimasi</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
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
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    <span className="material-symbols-outlined text-4xl text-slate-300">inbox</span>
                    <p className="mt-2">Tidak ada pengajuan klaim</p>
                  </td>
                </tr>
              ) : (
                filteredClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-50 transition-colors">
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
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenDetail(claim)}
                          className="px-3 py-1.5 bg-teal-500 text-white text-xs font-bold rounded-lg hover:bg-teal-600 transition-colors"
                        >
                          Review
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
              {/* Student Info */}
              <div className="bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-2xl p-4">
                <h3 className="text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Data Mahasiswa</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-[var(--theme-text-subtle)]">Nama</p>
                    <p className="font-semibold text-sm">{selectedClaim.mahasiswa?.nama || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--theme-text-subtle)]">NIM</p>
                    <p className="font-semibold text-sm">{selectedClaim.mahasiswa?.nim || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--theme-text-subtle)]">Program Studi</p>
                    <p className="font-semibold text-sm">{selectedClaim.mahasiswa?.program_studi?.nama || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--theme-text-subtle)]">Fakultas</p>
                    <p className="font-semibold text-sm">{selectedClaim.mahasiswa?.fakultas?.nama || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Claim Info */}
              <div className="bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-2xl p-4">
                <h3 className="text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Detail Klaim</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--theme-text-muted)]">Provider</span>
                    <ProviderBadge provider={selectedClaim.jenis_provider} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--theme-text-muted)]">Tanggal Kejadian</span>
                    <span className="text-sm font-semibold">{formatDate(selectedClaim.tanggal_kejadian)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--theme-text-muted)]">Lokasi Faskes</span>
                    <span className="text-sm font-semibold">{selectedClaim.lokasi_faskes || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--theme-text-muted)]">Estimasi Biaya</span>
                    <span className="text-sm font-bold text-[var(--theme-primary)]">{formatCurrency(selectedClaim.estimasi_biaya)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--theme-text-muted)]">Status</span>
                    <StatusBadge status={selectedClaim.status} />
                  </div>
                </div>
              </div>

              {/* Kronologis */}
              <div>
                <h3 className="text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Kronologis</h3>
                <p className="text-sm text-[var(--theme-text)] bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl p-3">{selectedClaim.deskripsi || '—'}</p>
              </div>

              {/* Catatan Review */}
              {selectedClaim.catatan_review && (
                <div>
                  <h3 className="text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Catatan Review</h3>
                  <p className="text-sm text-[var(--theme-text)] bg-[var(--theme-info-light)] rounded-xl p-3 border border-[var(--theme-border)]">{selectedClaim.catatan_review}</p>
                </div>
              )}

              {/* Document */}
              {selectedClaim.file_url && (
                <div>
                  <h3 className="text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">Dokumen</h3>
                  <div className="flex items-center gap-2 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl p-3">
                    <span className="material-symbols-outlined text-[var(--theme-text-subtle)]">attach_file</span>
                    <span className="text-sm text-[var(--theme-text)]">{selectedClaim.nama_file || 'Dokumen terlampir'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            {selectedClaim.status === 'PENDING_VERIFICATION' && (
              <DialogFooter className="flex gap-3">
                <button
                  onClick={() => handleUpdateStatus('APPROVED_TK')}
                  disabled={processing}
                  className="flex-1 h-10 flex items-center justify-center gap-2 bg-[var(--theme-success)] hover:bg-[var(--theme-success)]/95 text-white font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer text-xs uppercase tracking-wider"
                >
                  <CheckCircle size={18} />
                  Setujui
                </button>
                <button
                  onClick={() => handleUpdateStatus('REJECTED')}
                  disabled={processing}
                  className="flex-1 h-10 flex items-center justify-center gap-2 bg-[var(--theme-error)] hover:bg-[var(--theme-error)]/95 text-white font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer text-xs uppercase tracking-wider"
                >
                  <CancelIcon size={18} />
                  Tolak
                </button>
              </DialogFooter>
            )}
          </DialogContent>
        )}
      </Dialog>
    </PageContent>
  );
}
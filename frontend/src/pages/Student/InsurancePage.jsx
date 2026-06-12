import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { insuranceService } from '../../services/api';
import toast from 'react-hot-toast';
import StudentPageHeader from './components/StudentPageHeader';

// Auto-injected Material Symbol fallbacks
const InsuranceIcon = ({ size, className, ...props }) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>health_and_safety</span>
);
const DocumentIcon = ({ size, className, ...props }) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>description</span>
);
const UploadIcon = ({ size, className, ...props }) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>cloud_upload</span>
);
const CheckCircle = ({ size, className, ...props }) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>check_circle</span>
);
const Clock = ({ size, className, ...props }) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>schedule</span>
);
const XCircle = ({ size, className, ...props }) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>cancel</span>
);
const Calendar = ({ size, className, ...props }) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 20, ...props.style }} {...props}>calendar_month</span>
);
const Location = ({ size, className, ...props }) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 20, ...props.style }} {...props}>location_on</span>
);
const AttachFile = ({ size, className, ...props }) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 20, ...props.style }} {...props}>attach_file</span>
);
const DownloadIcon = ({ size, className, ...props }) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 20, ...props.style }} {...props}>download</span>
);

// Provider options
const PROVIDER_OPTIONS = [
  { value: 'BKU_Assurance', label: 'BKU Assurance (Kampus)', color: 'bg-[var(--theme-primary)]', textColor: 'text-[var(--theme-primary)]', border: 'border-[var(--theme-primary)]/20', bg: 'bg-[var(--theme-primary)]/10' },
  { value: 'BPJS', label: 'BPJS Kesehatan', color: 'bg-[var(--theme-success)]', textColor: 'text-[var(--theme-success)]', border: 'border-[var(--theme-success)]/20', bg: 'bg-[var(--theme-success)]/10' },
  { value: 'Asuransi_Lain', label: 'Asuransi Swasta Lain', color: 'bg-[var(--theme-warning)]', textColor: 'text-[var(--theme-warning)]', border: 'border-[var(--theme-warning)]/20', bg: 'bg-[var(--theme-warning)]/10' },
];

// Status badge component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    'PENDING_VERIFICATION': { label: 'Menunggu Verifikasi', bg: 'bg-[var(--theme-warning)]/10', text: 'text-[var(--theme-warning)]', border: 'border-[var(--theme-warning)]/20', icon: Clock },
    'APPROVED_TK': { label: 'Disetujui Nakes', bg: 'bg-[var(--theme-primary)]/10', text: 'text-[var(--theme-primary)]', border: 'border-[var(--theme-primary)]/20', icon: CheckCircle },
    'APPROVED_FINAL': { label: 'Disetujui Final', bg: 'bg-[var(--theme-success)]/10', text: 'text-[var(--theme-success)]', border: 'border-[var(--theme-success)]/20', icon: CheckCircle },
    'REJECTED': { label: 'Ditolak', bg: 'bg-[var(--theme-error)]/10', text: 'text-[var(--theme-error)]', border: 'border-[var(--theme-error)]/20', icon: XCircle },
  };

  const config = statusConfig[status] || statusConfig['PENDING_VERIFICATION'];
  const IconComponent = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${config.bg} ${config.text} ${config.border}`}>
      <IconComponent size={12} />
      {config.label}
    </span>
  );
};

// Provider badge
const ProviderBadge = ({ provider }) => {
  const config = PROVIDER_OPTIONS.find(p => p.value === provider) || PROVIDER_OPTIONS[2];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${config.bg} ${config.textColor} border ${config.border}`}>
      {config.label}
    </span>
  );
};

export default function InsurancePage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('ajuan'); // 'ajuan' | 'riwayat'
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [form, setForm] = useState({
    jenis_provider: 'BKU_Assurance',
    tanggal_kejadian: '',
    lokasi_faskes: '',
    deskripsi: '',
    estimasi_biaya: '',
  });

  const [file, setFile] = useState(null);

  // Pre-fill form from routing state (e.g. from Health Screening detail)
  useEffect(() => {
    if (location.state) {
      setForm(prev => ({
        ...prev,
        jenis_provider: location.state.jenis_provider || 'BKU_Assurance',
        tanggal_kejadian: location.state.tanggal || '',
        deskripsi: location.state.deskripsi || '',
      }));
    }
  }, [location.state]);

  // Fetch claims
  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await insuranceService.getMyClaims();
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

  useEffect(() => {
    fetchClaims();
  }, []);

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 5MB');
        return;
      }
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Format file tidak valid (PDF, JPG, PNG)');
        return;
      }
      setFile(selectedFile);
    }
  };

  // Submit claim
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.tanggal_kejadian) {
      toast.error('Tanggal kejadian wajib diisi');
      return;
    }
    if (!form.deskripsi) {
      toast.error('Deskripsi kronologis wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      const res = await insuranceService.createClaim({
        jenis_provider: form.jenis_provider,
        tanggal_kejadian: form.tanggal_kejadian,
        lokasi_faskes: form.lokasi_faskes,
        deskripsi: form.deskripsi,
        estimasi_biaya: parseFloat(form.estimasi_biaya) || 0,
      });

      if (res.status === 'success') {
        const claimId = res.data?.id;
        
        // Upload document if exists
        if (file && claimId) {
          const formData = new FormData();
          formData.append('file', file);
          try {
            await insuranceService.uploadClaimDocument(claimId, formData);
          } catch (uploadErr) {
            console.warn('Document upload failed:', uploadErr);
            toast.error('Gagal mengunggah berkas dokumen pendukung.');
          }
        }

        toast.success('Pengajuan klaim asuransi berhasil dikirim!');
        
        // Reset form
        setForm({
          jenis_provider: 'BKU_Assurance',
          tanggal_kejadian: '',
          lokasi_faskes: '',
          deskripsi: '',
          estimasi_biaya: '',
        });
        setFile(null);

        // Refresh list & switch tab
        fetchClaims();
        setActiveTab('riwayat');
      }
    } catch (err) {
      toast.error(err.message || 'Gagal mengajukan klaim');
    } finally {
      setSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  const pendingClaim = claims.find(c => c.status === 'PENDING_VERIFICATION' || c.status === 'APPROVED_TK');
  const approvedClaim = claims.find(c => c.status === 'APPROVED_FINAL');
  const hasActiveClaim = pendingClaim || approvedClaim;

  return (
    <div className="px-4 py-5 md:px-6 md:py-6 lg:px-8 lg:py-8 font-body text-[#171717] min-h-screen bg-[#fafafa]">
      
      <div className="mb-8">
        <StudentPageHeader
          title="Klaim Asuransi"
          subtitle="Layanan Mandiri Klaim Asuransi Kesehatan Mahasiswa BKU"
          icon="health_and_safety"
          breadcrumbs={[{ label: 'Klaim Asuransi' }]}
          actions={
            <div className="flex p-1 bg-white rounded-2xl shadow-sm border border-[#e5e5e5] w-fit">
              <button 
                onClick={() => setActiveTab('ajuan')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs md:text-sm transition-all ${activeTab === 'ajuan' ? 'bg-bku-primary text-white shadow-md shadow-bku-primary/20' : 'text-[#a3a3a3] hover:text-[#525252]'}`}
              >
                <span className="material-symbols-outlined text-sm">add_circle</span>
                Ajukan Klaim
              </button>
              <button 
                onClick={() => setActiveTab('riwayat')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs md:text-sm transition-all ${activeTab === 'riwayat' ? 'bg-bku-primary text-white shadow-md shadow-bku-primary/20' : 'text-[#a3a3a3] hover:text-[#525252]'}`}
              >
                <span className="material-symbols-outlined text-sm">history</span>
                Riwayat Saya
                {claims.length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'riwayat' ? 'bg-white/20 text-white' : 'bg-[#e5e5e5] text-[#525252]'}`}
                  >
                    {claims.length}
                  </span>
                )}
              </button>
            </div>
          }
        />
      </div>

      {/* Ajukan Tab */}
      <AnimatePresence mode="wait">
        {activeTab === 'ajuan' && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left side: Guide & Stats */}
            <div className="space-y-6">
              {/* Info Card */}
              <div className="bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20 rounded-2xl p-6 shadow-sm">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-surface text-[var(--theme-primary)] flex items-center justify-center shrink-0 border border-[var(--theme-primary)]/20">
                    <span className="material-symbols-outlined">info</span>
                  </div>
                  <div>
                    <h3 className="font-black text-[var(--theme-primary)] text-sm uppercase tracking-wider mb-2">Panduan Klaim</h3>
                    <ul className="text-xs text-[var(--theme-text)] space-y-2 leading-relaxed font-semibold">
                      <li className="flex items-start gap-1">
                        <span className="text-[var(--theme-primary)] font-bold">1.</span> Pilih provider asuransi kesehatan yang Anda gunakan.
                      </li>
                      <li className="flex items-start gap-1">
                        <span className="text-[var(--theme-primary)] font-bold">2.</span> Isi tanggal kejadian, lokasi faskes, dan kronologis secara jelas.
                      </li>
                      <li className="flex items-start gap-1">
                        <span className="text-[var(--theme-primary)] font-bold">3.</span> Unggah file pendukung seperti kuitansi biaya medis atau surat diagnosis (Max. 5MB).
                      </li>
                      <li className="flex items-start gap-1">
                        <span className="text-[var(--theme-primary)] font-bold">4.</span> Surat pengantar PDF dapat diunduh pada tab riwayat jika klaim disetujui Nakes.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm space-y-4">
                <h4 className="text-[10px] font-black text-[var(--theme-text-muted)] uppercase tracking-widest border-b border-[var(--theme-border-muted)] pb-2">Status Ringkasan</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-background border border-border rounded-xl p-3 text-center">
                    <p className="text-xl font-black text-[var(--theme-primary)]">{claims.length}</p>
                    <p className="text-[9px] font-bold text-[var(--theme-text-muted)] uppercase mt-1">Total</p>
                  </div>
                  <div className="bg-[var(--theme-warning)]/10 border border-[var(--theme-warning)]/20 rounded-xl p-3 text-center">
                    <p className="text-xl font-black text-[var(--theme-warning)]">
                      {claims.filter(c => c.status === 'PENDING_VERIFICATION').length}
                    </p>
                    <p className="text-[9px] font-bold text-[var(--theme-warning)] uppercase mt-1">Proses</p>
                  </div>
                  <div className="bg-[var(--theme-success)]/10 border border-[var(--theme-success)]/20 rounded-xl p-3 text-center">
                    <p className="text-xl font-black text-[var(--theme-success)]">
                      {claims.filter(c => c.status === 'APPROVED_TK' || c.status === 'APPROVED_FINAL').length}
                    </p>
                    <p className="text-[9px] font-bold text-[var(--theme-success)] uppercase mt-1">Setuju</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Form */}
            <div className="lg:col-span-2 space-y-6">
              {hasActiveClaim ? (
                <div className="bg-surface rounded-2xl border border-border p-8 md:p-12 shadow-sm text-center flex flex-col items-center justify-center min-h-[400px]">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 border-2 shadow-sm ${approvedClaim ? 'bg-[var(--theme-success)]/10 border-[var(--theme-success)]/20' : 'bg-[var(--theme-warning)]/10 border-[var(--theme-warning)]/20'}`}>
                    <span className={`material-symbols-outlined text-4xl ${approvedClaim ? 'text-[var(--theme-success)]' : 'text-[var(--theme-warning)]'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      {approvedClaim ? 'check_circle' : 'hourglass_top'}
                    </span>
                  </div>
                  <h3 className="font-black text-[var(--theme-text)] text-xl mb-3">
                    {approvedClaim ? 'Klaim Asuransi Telah Disetujui' : 'Pengajuan Sedang Diproses'}
                  </h3>
                  <p className="text-[var(--theme-text-muted)] text-sm font-semibold leading-relaxed mb-8 max-w-md">
                    {approvedClaim 
                      ? 'Surat pengantar klaim asuransi Anda telah berhasil diterbitkan dan siap diunduh. Anda tidak dapat mengajukan klaim baru saat ini.' 
                      : 'Anda masih memiliki pengajuan klaim asuransi yang sedang menunggu persetujuan dari Tenaga Kesehatan. Harap tunggu proses ini selesai sebelum mengajukan klaim baru.'}
                  </p>
                  <button
                    onClick={() => setActiveTab('riwayat')}
                    className="px-6 py-3 bg-[var(--theme-primary)] text-white text-sm font-black rounded-xl hover:bg-[var(--theme-primary-hover)] transition-all shadow-md shadow-[var(--theme-primary)]/20 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">history</span>
                    Lihat Status Pengajuan
                  </button>
                </div>
              ) : (
                <div className="bg-surface rounded-2xl border border-border p-6 md:p-8 shadow-sm space-y-6">
                  {/* Form Card */}
                
                {/* Provider Selection */}
                <div>
                  <label className="block text-[10px] font-black text-[var(--theme-text-muted)] uppercase tracking-widest mb-3">Pilih Provider Asuransi *</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {PROVIDER_OPTIONS.map((provider) => {
                      const isSelected = form.jenis_provider === provider.value;
                      return (
                        <label
                          key={provider.value}
                          className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] shadow-sm shadow-[var(--theme-primary)]/5'
                              : 'border-border hover:border-[var(--theme-primary)] hover:bg-background'
                          }`}
                        >
                          <input
                            type="radio"
                            name="jenis_provider"
                            value={provider.value}
                            checked={isSelected}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-[var(--theme-primary)] focus:ring-[var(--theme-primary)]/20"
                          />
                          <div className="flex flex-col">
                            <span className="font-black text-sm">{provider.label.split(' (')[0]}</span>
                            <span className="text-[10px] text-[var(--theme-text-muted)] font-bold uppercase tracking-wider mt-0.5">
                              {provider.value === 'BKU_Assurance' ? 'Kampus BKU' : provider.value === 'BPJS' ? 'Nasional' : 'Swasta'}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-[var(--theme-text-muted)] uppercase tracking-widest mb-2">Tanggal Kejadian *</label>
                    <div className="relative">
                      <input
                        type="date"
                        name="tanggal_kejadian"
                        value={form.tanggal_kejadian}
                        onChange={handleInputChange}
                        className="w-full p-3.5 pl-4 bg-background border border-border rounded-xl text-sm focus:border-[var(--theme-primary)] focus:bg-surface outline-none transition-all font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[var(--theme-text-muted)] uppercase tracking-widest mb-2">Estimasi Biaya Medis (Rp)</label>
                    <input
                      type="number"
                      name="estimasi_biaya"
                      value={form.estimasi_biaya}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full p-3.5 pl-4 bg-background border border-border rounded-xl text-sm focus:border-[var(--theme-primary)] focus:bg-surface outline-none transition-all font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[var(--theme-text-muted)] uppercase tracking-widest mb-2">Lokasi Fasilitas Kesehatan</label>
                  <input
                    type="text"
                    name="lokasi_faskes"
                    value={form.lokasi_faskes}
                    onChange={handleInputChange}
                    placeholder="Contoh: RS Hermina Bandung, Klinik UBK"
                    className="w-full p-3.5 pl-4 bg-background border border-border rounded-xl text-sm focus:border-[var(--theme-primary)] focus:bg-surface outline-none transition-all font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[var(--theme-text-muted)] uppercase tracking-widest mb-2">Kronologis Kejadian *</label>
                  <textarea
                    name="deskripsi"
                    value={form.deskripsi}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Jelaskan kronologis kejadian medis secara lengkap (kapan, di mana, keluhan yang dialami)..."
                    className="w-full p-4 bg-background border border-border rounded-xl text-sm focus:border-[var(--theme-primary)] focus:bg-surface outline-none transition-all font-medium resize-none leading-relaxed"
                  />
                </div>

                {/* Upload Dokumen */}
                <div>
                  <label className="block text-[10px] font-black text-[var(--theme-text-muted)] uppercase tracking-widest mb-2">Unggah Dokumen Pendukung (Opsional)</label>
                  <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                    file 
                      ? 'border-[var(--theme-success)] bg-[var(--theme-success)]/10 text-[var(--theme-success)]' 
                      : 'border-border hover:border-[var(--theme-primary)] bg-background hover:bg-surface'
                  }`}>
                    <input
                      type="file"
                      id="file-upload"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer block">
                      {file ? (
                        <div className="flex items-center justify-center gap-3 text-[var(--theme-success)]">
                          <div className="w-10 h-10 rounded-xl bg-[var(--theme-success)] text-white flex items-center justify-center shadow-md">
                            <span className="material-symbols-outlined text-lg">check_circle</span>
                          </div>
                          <div className="text-left">
                            <p className="font-black text-sm max-w-[200px] md:max-w-xs truncate">{file.name}</p>
                            <p className="text-[10px] text-[var(--theme-text-muted)] font-bold">{(file.size / 1024).toFixed(1)} KB • Klik untuk mengganti</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <UploadIcon size={32} className="mx-auto text-[var(--theme-text-muted)]" />
                          <p className="text-sm font-black text-[var(--theme-text)]">Pilih berkas untuk diunggah</p>
                          <p className="text-[10px] text-[var(--theme-text-muted)] font-bold uppercase tracking-wider">PDF, JPG, PNG (Maks. 5MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-4 bg-[var(--theme-primary)] text-white font-black rounded-xl shadow-xl shadow-[var(--theme-primary)]/20 hover:bg-[var(--theme-primary-hover)] transition-all hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>progress_activity</span>
                      Memproses Klaim...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check</span>
                      Kirim Pengajuan Klaim
                    </>
                  )}
                </button>
              </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Riwayat Tab */}
      <AnimatePresence mode="wait">
        {activeTab === 'riwayat' && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25 }}
            className="space-y-4"
          >
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-surface rounded-2xl p-5 border border-border animate-pulse space-y-3">
                    <div className="h-4 bg-[var(--theme-border)] rounded w-1/4"></div>
                    <div className="h-4 bg-[var(--theme-border-muted)] rounded w-3/4"></div>
                    <div className="h-3 bg-[var(--theme-border-muted)] rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : claims.length === 0 ? (
              <div className="bg-surface rounded-2xl p-12 border border-border text-center max-w-lg mx-auto shadow-sm">
                <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center mx-auto mb-4 border border-border">
                  <span className="material-symbols-outlined text-3xl text-[var(--theme-text-muted)]">receipt_long</span>
                </div>
                <h3 className="font-black text-[var(--theme-text)] text-lg mb-1">Belum Ada Riwayat Klaim</h3>
                <p className="text-[var(--theme-text-muted)] text-xs font-semibold leading-relaxed mb-6">Seluruh daftar pengajuan klaim asuransi kesehatan mandiri Anda akan ditampilkan di sini.</p>
                <button
                  onClick={() => setActiveTab('ajuan')}
                  className="px-6 py-3 bg-[var(--theme-primary)] text-white text-xs font-black rounded-xl hover:bg-[var(--theme-primary-hover)] transition-all"
                >
                  Ajukan Klaim Pertama Anda
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {claims.map((claim) => {
                  const borderColors = {
                    'PENDING_VERIFICATION': 'border-l-[var(--theme-warning)]',
                    'APPROVED_TK': 'border-l-[var(--theme-primary)]',
                    'APPROVED_FINAL': 'border-l-[var(--theme-success)]',
                    'REJECTED': 'border-l-[var(--theme-error)]',
                  };
                  const statusBorder = borderColors[claim.status] || 'border-l-slate-300';
                  
                  return (
                    <div 
                      key={claim.id} 
                      className={`bg-surface rounded-2xl p-5 border border-border border-l-4 ${statusBorder} hover:shadow-md transition-all flex flex-col justify-between`}
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <ProviderBadge provider={claim.jenis_provider} />
                          <StatusBadge status={claim.status} />
                        </div>
                        
                        <div>
                          <p className="text-[10px] text-[var(--theme-text-muted)] font-black uppercase tracking-wider mb-0.5">ID Pengajuan</p>
                          <code className="text-xs font-bold bg-background px-2 py-0.5 rounded border border-border text-[var(--theme-text-muted)]">#{claim.id}</code>
                        </div>
 
                        <div className="pt-2">
                          <p className="text-xs font-bold text-[var(--theme-text)] line-clamp-2 italic">"{claim.deskripsi}"</p>
                        </div>
 
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--theme-border-muted)]">
                          <div className="flex items-center gap-1.5 text-xs text-[var(--theme-text-muted)] font-semibold">
                            <Calendar size={14} />
                            <span>{formatDate(claim.tanggal_kejadian)}</span>
                          </div>
                          <div className="text-right text-xs font-black text-[var(--theme-primary)]">
                            <span>Estimasi: {formatCurrency(claim.estimasi_biaya)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-4 mt-3 border-t border-[var(--theme-border-muted)]">
                        <button
                          onClick={() => setSelectedClaim(claim)}
                          className="px-4 py-2 rounded-xl bg-surface border border-border text-xs font-black hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)] transition-all"
                        >
                          Lihat Detail
                        </button>
                        {claim.surat_pengantar_url && (
                          <a
                            href={claim.surat_pengantar_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20 text-xs font-black text-[var(--theme-primary)] hover:bg-[var(--theme-primary)] hover:text-white transition-all flex items-center gap-1 shadow-sm shadow-[var(--theme-primary)]/5"
                          >
                            <DownloadIcon size={14} />
                            Surat Pengantar
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* DETAIL MODAL */}
      <Dialog open={!!selectedClaim} onOpenChange={() => setSelectedClaim(null)} maxWidth="max-w-2xl">
        <DialogContent>
          <DialogHeader>
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <span className="material-symbols-outlined text-8xl text-slate-900">health_and_safety</span>
            </div>
            <div className="text-left relative z-10">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Detail Klaim Asuransi</p>
              <DialogTitle className="text-xl font-extrabold mt-1 text-[#171717] leading-tight">ID Pengajuan: #{selectedClaim?.id}</DialogTitle>
            </div>
          </DialogHeader>

          {selectedClaim && (
            <div className="p-8 overflow-y-auto max-h-[50vh] no-scrollbar space-y-6 text-sm">
              {/* Stats Summary Block */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-background rounded-xl border border-border">
                  <p className="text-[9px] font-black text-[var(--theme-text-muted)] uppercase tracking-widest mb-1">Provider</p>
                  <span className="font-black text-xs text-[var(--theme-primary)]">
                    {PROVIDER_OPTIONS.find(p => p.value === selectedClaim.jenis_provider)?.label.split(' (')[0] || selectedClaim.jenis_provider}
                  </span>
                </div>
                <div className="p-3 bg-background rounded-xl border border-border">
                  <p className="text-[9px] font-black text-[var(--theme-text-muted)] uppercase tracking-widest mb-1">Tgl Kejadian</p>
                  <p className="text-xs font-black text-[var(--theme-text)]">{formatDate(selectedClaim.tanggal_kejadian)}</p>
                </div>
                <div className="p-3 bg-background rounded-xl border border-border">
                  <p className="text-[9px] font-black text-[var(--theme-text-muted)] uppercase tracking-widest mb-1">Estimasi Biaya</p>
                  <p className="text-xs font-black text-[var(--theme-text)]">{formatCurrency(selectedClaim.estimasi_biaya)}</p>
                </div>
                <div className="p-3 bg-background rounded-xl border border-border">
                  <p className="text-[9px] font-black text-[var(--theme-text-muted)] uppercase tracking-widest mb-1">Fasilitas Kesehatan</p>
                  <p className="text-xs font-black text-[var(--theme-text)] truncate">{selectedClaim.lokasi_faskes || '—'}</p>
                </div>
              </div>

              {/* Progress/Status Info */}
              <div className="p-4 bg-background rounded-xl border border-border space-y-3">
                <h4 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[var(--theme-text-muted)]">
                  <Clock size={16} className="text-[var(--theme-primary)]" /> Status Pengajuan
                </h4>
                <div className="flex items-center gap-3">
                  <StatusBadge status={selectedClaim.status} />
                  <span className="text-xs text-[var(--theme-text-muted)] font-bold">
                    {selectedClaim.status === 'PENDING_VERIFICATION' && 'Menunggu proses verifikasi awal oleh Tenaga Kesehatan.'}
                    {selectedClaim.status === 'APPROVED_TK' && 'Telah disetujui Tenaga Kesehatan. Pengajuan sedang diteruskan untuk persetujuan final.'}
                    {selectedClaim.status === 'APPROVED_FINAL' && 'Persetujuan akhir selesai. Seluruh proses klaim asuransi telah disetujui.'}
                    {selectedClaim.status === 'REJECTED' && 'Pengajuan ditolak. Silakan lihat catatan alasan penolakan.'}
                  </span>
                </div>
              </div>

              {/* Catatan Review (Jika ada) */}
              {selectedClaim.catatan_review && (
                <div className={`p-5 rounded-xl border ${
                  selectedClaim.status === 'REJECTED' 
                    ? 'bg-[var(--theme-error)]/10 border-[var(--theme-error)]/20 text-[var(--theme-error)]' 
                    : 'bg-[var(--theme-primary)]/10 border-[var(--theme-primary)]/20 text-[var(--theme-primary)]'
                }`}>
                  <h4 className="font-black text-xs uppercase tracking-wider mb-2">Catatan Reviewer Kesehatan:</h4>
                  <p className="font-semibold text-xs leading-relaxed">"{selectedClaim.catatan_review}"</p>
                </div>
              )}

              {/* Deskripsi Kronologi */}
              <div>
                <h4 className="text-[10px] font-black text-[var(--theme-text-muted)] uppercase tracking-widest mb-2">Kronologis Kejadian Medis</h4>
                <div className="bg-background p-5 rounded-xl border border-border leading-relaxed font-medium text-[var(--theme-text)]">
                  {selectedClaim.deskripsi || '—'}
                </div>
              </div>

              {/* Berkas Pendukung */}
              <div>
                <h4 className="text-[10px] font-black text-[var(--theme-text-muted)] uppercase tracking-widest mb-2">Berkas Dokumen Terlampir</h4>
                {selectedClaim.file_url ? (
                  <div className="flex justify-between items-center bg-background p-4 rounded-xl border border-border group hover:border-[var(--theme-primary)] transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] flex items-center justify-center shrink-0">
                        <DocumentIcon size={18} />
                      </div>
                      <div>
                        <p className="font-black text-xs text-slate-800 truncate max-w-xs">{selectedClaim.nama_file || 'Dokumen_Pendukung.pdf'}</p>
                        <p className="text-[9px] text-[var(--theme-text-muted)] font-bold uppercase tracking-wider">Berkas Tambahan Mahasiswa</p>
                      </div>
                    </div>
                    <a
                      href={selectedClaim.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-surface border border-border rounded-lg text-xs font-black text-[var(--theme-text)] hover:text-[var(--theme-primary)] hover:border-[var(--theme-primary)] transition-all flex items-center gap-1 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-sm">visibility</span> Lihat
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-[var(--theme-text-muted)] font-semibold italic">Tidak ada berkas dokumen pendukung yang dilampirkan.</p>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-3 bg-slate-50/30 p-8 border-t border-slate-100">
            <button 
              onClick={() => setSelectedClaim(null)}
              className="flex-1 py-3.5 rounded-xl font-black text-xs md:text-sm border border-border text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-all bg-surface active:scale-95 cursor-pointer"
            >
              Tutup
            </button>
            {selectedClaim?.surat_pengantar_url && (
              <a 
                href={selectedClaim.surat_pengantar_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3.5 rounded-xl font-black text-xs md:text-sm bg-[var(--theme-primary)] text-white hover:bg-[var(--theme-primary-hover)] text-center flex items-center justify-center gap-1.5 shadow-xl shadow-[var(--theme-primary)]/10 transition-all hover:scale-[1.01] active:scale-95"
              >
                <DownloadIcon size={16} /> Unduh Surat Pengantar
              </a>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


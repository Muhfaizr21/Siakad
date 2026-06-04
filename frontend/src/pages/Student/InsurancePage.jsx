import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { insuranceService } from '../../services/api';
import toast from 'react-hot-toast';

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
  { value: 'BKU_Assurance', label: 'BKU Assurance (Kampus)', color: 'bg-bku-primary', textColor: 'text-bku-primary', border: 'border-bku-primary', bg: 'bg-[#eef4ff]' },
  { value: 'BPJS', label: 'BPJS Kesehatan', color: 'bg-emerald-600', textColor: 'text-emerald-600', border: 'border-emerald-200', bg: 'bg-emerald-50' },
  { value: 'Asuransi_Lain', label: 'Asuransi Swasta Lain', color: 'bg-purple-600', textColor: 'text-purple-600', border: 'border-purple-200', bg: 'bg-purple-50' },
];

// Status badge component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    'PENDING_VERIFICATION': { label: 'Menunggu Verifikasi', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock },
    'APPROVED_TK': { label: 'Disetujui Nakes', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: CheckCircle },
    'APPROVED_FINAL': { label: 'Disetujui Final', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle },
    'REJECTED': { label: 'Ditolak', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle },
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

  return (
    <div className="px-4 py-5 md:px-6 md:py-6 lg:px-8 lg:py-8 font-body text-[#171717] min-h-screen bg-[#fafafa]">
      
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-headline tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 bg-bku-primary rounded-xl flex items-center justify-center shadow-md shadow-bku-primary/20">
              <InsuranceIcon size={22} className="text-white" />
            </div>
            Klaim Asuransi
          </h1>
          <p className="text-[#a3a3a3] mt-1.5 font-bold uppercase tracking-[0.16em] text-[10px]">Layanan Mandiri Klaim Asuransi Kesehatan Mahasiswa BKU</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-white rounded-2xl shadow-sm border border-[#e5e5e5] w-fit">
          <button 
            onClick={() => setActiveTab('ajuan')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs md:text-sm transition-all ${
              activeTab === 'ajuan' 
                ? 'bg-bku-primary text-white shadow-md shadow-bku-primary/20' 
                : 'text-[#a3a3a3] hover:text-[#525252]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">add_circle</span>
            Ajukan Klaim
          </button>
          <button 
            onClick={() => setActiveTab('riwayat')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs md:text-sm transition-all ${
              activeTab === 'riwayat' 
                ? 'bg-bku-primary text-white shadow-md shadow-bku-primary/20' 
                : 'text-[#a3a3a3] hover:text-[#525252]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">history</span>
            Riwayat Saya
            {claims.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'riwayat' ? 'bg-white/20 text-white' : 'bg-[#e5e5e5] text-[#525252]'}`}>
                {claims.length}
              </span>
            )}
          </button>
        </div>
      </motion.div>

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
              <div className="bg-[#eef4ff] border border-[#c9d8ff] rounded-[24px] p-6 shadow-sm">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white text-bku-primary flex items-center justify-center shrink-0 border border-[#c9d8ff]">
                    <span className="material-symbols-outlined">info</span>
                  </div>
                  <div>
                    <h3 className="font-black text-bku-primary text-sm uppercase tracking-wider mb-2">Panduan Klaim</h3>
                    <ul className="text-xs text-slate-700 space-y-2 leading-relaxed font-semibold">
                      <li className="flex items-start gap-1">
                        <span className="text-bku-primary font-bold">1.</span> Pilih provider asuransi kesehatan yang Anda gunakan.
                      </li>
                      <li className="flex items-start gap-1">
                        <span className="text-bku-primary font-bold">2.</span> Isi tanggal kejadian, lokasi faskes, dan kronologis secara jelas.
                      </li>
                      <li className="flex items-start gap-1">
                        <span className="text-bku-primary font-bold">3.</span> Unggah file pendukung seperti kuitansi biaya medis atau surat diagnosis (Max. 5MB).
                      </li>
                      <li className="flex items-start gap-1">
                        <span className="text-bku-primary font-bold">4.</span> Surat pengantar PDF dapat diunduh pada tab riwayat jika klaim disetujui Nakes.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-white rounded-[24px] border border-[#e5e5e5] p-6 shadow-sm space-y-4">
                <h4 className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest border-b border-[#f5f5f5] pb-2">Status Ringkasan</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#fafafa] border border-[#e5e5e5] rounded-xl p-3 text-center">
                    <p className="text-xl font-black text-bku-primary">{claims.length}</p>
                    <p className="text-[9px] font-bold text-[#a3a3a3] uppercase mt-1">Total</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                    <p className="text-xl font-black text-amber-700">
                      {claims.filter(c => c.status === 'PENDING_VERIFICATION').length}
                    </p>
                    <p className="text-[9px] font-bold text-amber-600 uppercase mt-1">Proses</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                    <p className="text-xl font-black text-emerald-700">
                      {claims.filter(c => c.status === 'APPROVED_TK' || c.status === 'APPROVED_FINAL').length}
                    </p>
                    <p className="text-[9px] font-bold text-emerald-600 uppercase mt-1">Setuju</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Form Card */}
              <div className="bg-white rounded-[24px] border border-[#e5e5e5] p-6 md:p-8 shadow-sm space-y-6">
                
                {/* Provider Selection */}
                <div>
                  <label className="block text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest mb-3">Pilih Provider Asuransi *</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {PROVIDER_OPTIONS.map((provider) => {
                      const isSelected = form.jenis_provider === provider.value;
                      return (
                        <label
                          key={provider.value}
                          className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-bku-primary bg-[#eef4ff] text-bku-primary shadow-sm shadow-bku-primary/5'
                              : 'border-[#e5e5e5] hover:border-bku-primary hover:bg-[#fafafa]'
                          }`}
                        >
                          <input
                            type="radio"
                            name="jenis_provider"
                            value={provider.value}
                            checked={isSelected}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-bku-primary focus:ring-bku-primary"
                          />
                          <div className="flex flex-col">
                            <span className="font-black text-sm">{provider.label.split(' (')[0]}</span>
                            <span className="text-[10px] text-[#a3a3a3] font-bold uppercase tracking-wider mt-0.5">
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
                    <label className="block text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest mb-2">Tanggal Kejadian *</label>
                    <div className="relative">
                      <input
                        type="date"
                        name="tanggal_kejadian"
                        value={form.tanggal_kejadian}
                        onChange={handleInputChange}
                        className="w-full p-3.5 pl-4 bg-[#fafafa] border border-[#e5e5e5] rounded-2xl text-sm focus:border-bku-primary focus:bg-white outline-none transition-all font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest mb-2">Estimasi Biaya Medis (Rp)</label>
                    <input
                      type="number"
                      name="estimasi_biaya"
                      value={form.estimasi_biaya}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full p-3.5 pl-4 bg-[#fafafa] border border-[#e5e5e5] rounded-2xl text-sm focus:border-bku-primary focus:bg-white outline-none transition-all font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest mb-2">Lokasi Fasilitas Kesehatan</label>
                  <input
                    type="text"
                    name="lokasi_faskes"
                    value={form.lokasi_faskes}
                    onChange={handleInputChange}
                    placeholder="Contoh: RS Hermina Bandung, Klinik UBK"
                    className="w-full p-3.5 pl-4 bg-[#fafafa] border border-[#e5e5e5] rounded-2xl text-sm focus:border-bku-primary focus:bg-white outline-none transition-all font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest mb-2">Kronologis Kejadian *</label>
                  <textarea
                    name="deskripsi"
                    value={form.deskripsi}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Jelaskan kronologis kejadian medis secara lengkap (kapan, di mana, keluhan yang dialami)..."
                    className="w-full p-4 bg-[#fafafa] border border-[#e5e5e5] rounded-2xl text-sm focus:border-bku-primary focus:bg-white outline-none transition-all font-medium resize-none leading-relaxed"
                  />
                </div>

                {/* Upload Dokumen */}
                <div>
                  <label className="block text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest mb-2">Unggah Dokumen Pendukung (Opsional)</label>
                  <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                    file 
                      ? 'border-green-500 bg-green-50/50' 
                      : 'border-[#e5e5e5] hover:border-bku-primary bg-[#fafafa] hover:bg-white'
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
                        <div className="flex items-center justify-center gap-3 text-green-700">
                          <div className="w-10 h-10 rounded-xl bg-green-600 text-white flex items-center justify-center shadow-md">
                            <span className="material-symbols-outlined text-lg">check_circle</span>
                          </div>
                          <div className="text-left">
                            <p className="font-black text-sm max-w-[200px] md:max-w-xs truncate">{file.name}</p>
                            <p className="text-[10px] text-[#a3a3a3] font-bold">{(file.size / 1024).toFixed(1)} KB • Klik untuk mengganti</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <UploadIcon size={32} className="mx-auto text-[#a3a3a3]" />
                          <p className="text-sm font-black text-[#525252]">Pilih berkas untuk diunggah</p>
                          <p className="text-[10px] text-[#a3a3a3] font-bold uppercase tracking-wider">PDF, JPG, PNG (Maks. 5MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-4 bg-bku-primary text-white font-black rounded-2xl shadow-xl shadow-bku-primary/20 hover:bg-[#0B4FAE] transition-all hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center gap-2"
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
                  <div key={i} className="bg-white rounded-2xl p-5 border border-[#e5e5e5] animate-pulse space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : claims.length === 0 ? (
              <div className="bg-white rounded-[24px] p-12 border border-[#e5e5e5] text-center max-w-lg mx-auto shadow-sm">
                <div className="w-16 h-16 rounded-full bg-[#f5f5f5] flex items-center justify-center mx-auto mb-4 border border-[#e5e5e5]">
                  <span className="material-symbols-outlined text-3xl text-[#a3a3a3]">receipt_long</span>
                </div>
                <h3 className="font-black text-[#171717] text-lg mb-1">Belum Ada Riwayat Klaim</h3>
                <p className="text-[#a3a3a3] text-xs font-semibold leading-relaxed mb-6">Seluruh daftar pengajuan klaim asuransi kesehatan mandiri Anda akan ditampilkan di sini.</p>
                <button
                  onClick={() => setActiveTab('ajuan')}
                  className="px-6 py-3 bg-bku-primary text-white text-xs font-black rounded-xl hover:bg-[#0B4FAE] transition-all"
                >
                  Ajukan Klaim Pertama Anda
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {claims.map((claim) => {
                  const borderColors = {
                    'PENDING_VERIFICATION': 'border-l-amber-500',
                    'APPROVED_TK': 'border-l-blue-500',
                    'APPROVED_FINAL': 'border-l-emerald-500',
                    'REJECTED': 'border-l-red-500',
                  };
                  const statusBorder = borderColors[claim.status] || 'border-l-slate-300';
                  
                  return (
                    <div 
                      key={claim.id} 
                      className={`bg-white rounded-2xl p-5 border border-[#e5e5e5] border-l-4 ${statusBorder} hover:shadow-md transition-all flex flex-col justify-between`}
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <ProviderBadge provider={claim.jenis_provider} />
                          <StatusBadge status={claim.status} />
                        </div>
                        
                        <div>
                          <p className="text-[10px] text-[#a3a3a3] font-black uppercase tracking-wider mb-0.5">ID Pengajuan</p>
                          <code className="text-xs font-bold bg-[#fafafa] px-2 py-0.5 rounded border border-[#e5e5e5] text-slate-600">#{claim.id}</code>
                        </div>

                        <div className="pt-2">
                          <p className="text-xs font-bold text-slate-700 line-clamp-2 italic">"{claim.deskripsi}"</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#f5f5f5]">
                          <div className="flex items-center gap-1.5 text-xs text-[#a3a3a3] font-semibold">
                            <Calendar size={14} />
                            <span>{formatDate(claim.tanggal_kejadian)}</span>
                          </div>
                          <div className="text-right text-xs font-black text-bku-primary">
                            <span>Estimasi: {formatCurrency(claim.estimasi_biaya)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-4 mt-3 border-t border-[#f5f5f5]">
                        <button
                          onClick={() => setSelectedClaim(claim)}
                          className="px-4 py-2 rounded-xl bg-white border border-[#e5e5e5] text-xs font-black hover:border-bku-primary hover:text-bku-primary transition-all"
                        >
                          Lihat Detail
                        </button>
                        {claim.surat_pengantar_url && (
                          <a
                            href={claim.surat_pengantar_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl bg-[#eef4ff] border border-[#c9d8ff] text-xs font-black text-bku-primary hover:bg-bku-primary hover:text-white transition-all flex items-center gap-1 shadow-sm shadow-bku-primary/5"
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
      <AnimatePresence>
        {selectedClaim && (
          <div className="fixed inset-0 z-50 bg-[#171717]/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-2xl rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="relative h-24 bg-gradient-to-r from-bku-primary to-[#0B4FAE] p-6 flex items-center text-white">
                <button 
                  onClick={() => setSelectedClaim(null)} 
                  className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>close</span>
                </button>
                <div>
                  <h2 className="text-xl font-black font-headline">Detail Klaim Asuransi</h2>
                  <p className="text-[10px] text-white/60 font-black uppercase tracking-[0.2em] mt-1">ID Pengajuan: #{selectedClaim.id}</p>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6 custom-scrollbar text-sm">
                
                {/* Stats Summary Block */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-[#fafafa] rounded-2xl border border-[#e5e5e5]">
                    <p className="text-[9px] font-black text-[#a3a3a3] uppercase tracking-widest mb-1">Provider</p>
                    <span className="font-black text-xs text-bku-primary">
                      {PROVIDER_OPTIONS.find(p => p.value === selectedClaim.jenis_provider)?.label.split(' (')[0] || selectedClaim.jenis_provider}
                    </span>
                  </div>
                  <div className="p-3 bg-[#fafafa] rounded-2xl border border-[#e5e5e5]">
                    <p className="text-[9px] font-black text-[#a3a3a3] uppercase tracking-widest mb-1">Tgl Kejadian</p>
                    <p className="text-xs font-black text-[#171717]">{formatDate(selectedClaim.tanggal_kejadian)}</p>
                  </div>
                  <div className="p-3 bg-[#fafafa] rounded-2xl border border-[#e5e5e5]">
                    <p className="text-[9px] font-black text-[#a3a3a3] uppercase tracking-widest mb-1">Estimasi Biaya</p>
                    <p className="text-xs font-black text-[#171717]">{formatCurrency(selectedClaim.estimasi_biaya)}</p>
                  </div>
                  <div className="p-3 bg-[#fafafa] rounded-2xl border border-[#e5e5e5]">
                    <p className="text-[9px] font-black text-[#a3a3a3] uppercase tracking-widest mb-1">Fasilitas Kesehatan</p>
                    <p className="text-xs font-black text-[#171717] truncate">{selectedClaim.lokasi_faskes || '—'}</p>
                  </div>
                </div>

                {/* Progress/Status Info */}
                <div className="p-4 bg-[#fafafa] rounded-2xl border border-[#e5e5e5] space-y-3">
                  <h4 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#525252]">
                    <Clock size={16} className="text-bku-primary" /> Status Pengajuan
                  </h4>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={selectedClaim.status} />
                    <span className="text-xs text-[#a3a3a3] font-bold">
                      {selectedClaim.status === 'PENDING_VERIFICATION' && 'Menunggu proses verifikasi awal oleh Tenaga Kesehatan.'}
                      {selectedClaim.status === 'APPROVED_TK' && 'Telah disetujui Tenaga Kesehatan. Pengajuan sedang diteruskan untuk persetujuan final.'}
                      {selectedClaim.status === 'APPROVED_FINAL' && 'Persetujuan akhir selesai. Seluruh proses klaim asuransi telah disetujui.'}
                      {selectedClaim.status === 'REJECTED' && 'Pengajuan ditolak. Silakan lihat catatan alasan penolakan.'}
                    </span>
                  </div>
                </div>

                {/* Catatan Review (Jika ada) */}
                {selectedClaim.catatan_review && (
                  <div className={`p-5 rounded-[20px] border ${
                    selectedClaim.status === 'REJECTED' 
                      ? 'bg-red-50 border-red-200 text-red-700' 
                      : 'bg-blue-50 border-blue-200 text-blue-700'
                  }`}>
                    <h4 className="font-black text-xs uppercase tracking-wider mb-2">Catatan Reviewer Kesehatan:</h4>
                    <p className="font-semibold text-xs leading-relaxed">"{selectedClaim.catatan_review}"</p>
                  </div>
                )}

                {/* Deskripsi Kronologi */}
                <div>
                  <h4 className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest mb-2">Kronologis Kejadian Medis</h4>
                  <div className="bg-[#fafafa] p-5 rounded-[20px] border border-[#e5e5e5] leading-relaxed font-medium text-slate-700">
                    {selectedClaim.deskripsi || '—'}
                  </div>
                </div>

                {/* Berkas Pendukung */}
                <div>
                  <h4 className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest mb-2">Berkas Dokumen Terlampir</h4>
                  {selectedClaim.file_url ? (
                    <div className="flex justify-between items-center bg-[#fafafa] p-4 rounded-xl border border-[#e5e5e5] group hover:border-bku-primary transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-bku-primary/10 text-bku-primary flex items-center justify-center shrink-0">
                          <DocumentIcon size={18} />
                        </div>
                        <div>
                          <p className="font-black text-xs text-slate-800 truncate max-w-xs">{selectedClaim.nama_file || 'Dokumen_Pendukung.pdf'}</p>
                          <p className="text-[9px] text-[#a3a3a3] font-bold uppercase tracking-wider">Berkas Tambahan Mahasiswa</p>
                        </div>
                      </div>
                      <a
                        href={selectedClaim.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-white border border-[#e5e5e5] rounded-lg text-xs font-black text-[#525252] hover:text-bku-primary hover:border-bku-primary transition-all flex items-center gap-1 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-sm">visibility</span> Lihat
                      </a>
                    </div>
                  ) : (
                    <p className="text-xs text-[#a3a3a3] font-semibold italic">Tidak ada berkas dokumen pendukung yang dilampirkan.</p>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-[#f5f5f5] flex gap-3 bg-[#fafafa]">
                <button 
                  onClick={() => setSelectedClaim(null)}
                  className="flex-1 py-3.5 rounded-2xl font-black text-xs md:text-sm border border-[#e5e5e5] text-[#a3a3a3] hover:text-[#171717] transition-all bg-white"
                >
                  Tutup
                </button>
                {selectedClaim.surat_pengantar_url && (
                  <a 
                    href={selectedClaim.surat_pengantar_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3.5 rounded-2xl font-black text-xs md:text-sm bg-bku-primary text-white hover:bg-[#0B4FAE] text-center flex items-center justify-center gap-1.5 shadow-xl shadow-bku-primary/10 transition-all hover:scale-[1.01]"
                  >
                    <DownloadIcon size={16} /> Unduh Surat Pengantar
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
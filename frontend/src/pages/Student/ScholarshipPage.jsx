import React, { useState, useRef } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { 
  useScholarshipKatalogQuery, 
  useScholarshipRiwayatQuery, 
  useDaftarBeasiswaMutation 
} from '../../queries/useScholarshipQuery';
import { 
  GraduationCap, Search, Filter, Calendar, Users, Wallet, 
  Info, CheckCircle2, Clock, X, FileText, UploadCloud, 
  ArrowRight, AlertCircle, ChevronRight, Trophy, Sparkles, 
  History, LayoutGrid, Check, Loader2, Upload, FileCheck, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardGridSkeleton, TableSkeleton } from '../../components/ui/SkeletonGroups';
import EmptyState from '../../components/ui/EmptyState';
import { toast } from 'react-hot-toast';

// ======================== UTILITIES ========================
const formatRupiah = (number) => {
  if (number === undefined || number === null || isNaN(number)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(number);
};

const getDaysLeft = (deadline) => {
  const diff = new Date(deadline) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

// ======================== STATUS CONFIG ========================
const STATUS_BADGE = {
  dikirim: { label: 'Dikirim', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  seleksi_berkas: { label: 'Seleksi Berkas', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  evaluasi: { label: 'Evaluasi', color: 'text-[#00236F]', bg: 'bg-[#eef4ff]', border: 'border-[#c9d8ff]' },
  review: { label: 'Review', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  penetapan: { label: 'Penetapan', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  diterima: { label: 'Diterima', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  ditolak: { label: 'Ditolak', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
};

// ======================== APPLICATION MODAL (3-STEP WIZARD) ========================
function ApplyWizard({ scholarship, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [motivasi, setMotivasi] = useState('');
  const [prestasi, setPrestasi] = useState('');
  const [files, setFiles] = useState({}); // { key: File }
  const [agreed, setAgreed] = useState(false);
  const fileInputRefs = useRef({});
  const daftarMutation = useDaftarBeasiswaMutation();

  const handleFileChange = (key, file) => {
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }
    setFiles(prev => ({ ...prev, [key]: file }));
  };

  const isStep1Valid = motivasi.length >= 150;
  
  const requiredFiles = ['foto', 'ktm', 'kk'];
  if (scholarship.is_berbasis_ekonomi) requiredFiles.push('sktm');
  if (scholarship.syarat_ipk_min > 0) requiredFiles.push('transkrip');
  
  const isStep2Valid = requiredFiles.every(key => !!files[key]);

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append('motivasi', motivasi);
    formData.append('prestasi', prestasi);
    Object.entries(files).forEach(([key, file]) => {
      formData.append(key, file);
    });

    daftarMutation.mutate({ id: scholarship.id, formData }, {
      onSuccess: () => {
        onSuccess();
      },
      onError: (error) => {
        const msg = error.response?.data?.message || 'Gagal mengirim pendaftaran';
        toast.error(msg);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[60] bg-[#171717]/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white w-full max-w-4xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-8 border-b border-[#f5f5f5] flex justify-between items-center bg-[#fafafa]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#00236F] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Langkah {step} dari 3</span>
              <h2 className="text-2xl font-black font-headline">Pendaftaran Beasiswa</h2>
            </div>
            <p className="text-sm font-bold text-[#a3a3a3] uppercase tracking-wider">{scholarship.nama}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-[#e5e5e5]">
            <X size={24} className="text-[#a3a3a3]" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 bg-[#f5f5f5] w-full flex">
          {[1, 2, 3].map(i => (
            <div key={i} className={`flex-1 transition-all duration-500 ${step >= i ? 'bg-[#00236F]' : 'bg-transparent'}`} />
          ))}
        </div>

        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
          {/* STEP 1: DATA PENGAJUAN */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-[#a3a3a3] uppercase tracking-widest mb-2">Pernyataan Motivasi / Motivation Letter *</label>
                <textarea 
                  value={motivasi}
                  onChange={(e) => setMotivasi(e.target.value)}
                  placeholder="Jelaskan kenapa kamu layak menerima beasiswa ini... (min. 150 karakter)"
                  className="w-full h-48 p-5 rounded-2xl border border-[#e5e5e5] focus:border-[#00236F] outline-none text-sm leading-relaxed resize-none shadow-inner bg-[#fafafa] transition-all"
                />
                <div className="flex justify-between mt-2">
                  <p className={`text-[10px] font-bold ${motivasi.length < 150 ? 'text-red-500' : 'text-green-600'}`}>
                    {motivasi.length} / 150 Karakter Minimum
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[#a3a3a3] uppercase tracking-widest mb-2">Prestasi & Organisasi (Opsional)</label>
                <textarea 
                  value={prestasi}
                  onChange={(e) => setPrestasi(e.target.value)}
                  placeholder="Sebutkan prestasi akademik/non-akademik atau pengalaman organisasi yang relevan..."
                  className="w-full h-32 p-5 rounded-2xl border border-[#e5e5e5] focus:border-[#00236F] outline-none text-sm leading-relaxed resize-none shadow-inner bg-[#fafafa] transition-all"
                />
              </div>
            </motion.div>
          )}

          {/* STEP 2: UPLOAD BERKAS */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requiredFiles.map(key => (
                <div key={key} className="relative">
                  <label className="block text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest mb-2">
                    {key.replace('_', ' ')} {key !== 'lainnya' && '*'}
                  </label>
                  <div 
                    onClick={() => fileInputRefs.current[key].click()}
                    className={`p-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all flex items-center gap-4 ${
                      files[key] ? 'border-[#16a34a] bg-green-50' : 'border-[#e5e5e5] hover:border-[#00236F] bg-[#fafafa]'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${files[key] ? 'bg-green-600 text-white' : 'bg-white text-[#a3a3a3]'}`}>
                      {files[key] ? <FileCheck size={20} /> : <Upload size={20} />}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold truncate">{files[key] ? files[key].name : `Pilih Berkas ${key}`}</p>
                      <p className="text-[10px] text-[#a3a3a3] font-medium uppercase tracking-tighter">PDF/JPG (Max. 5MB)</p>
                    </div>
                    {files[key] && <Check size={16} className="text-[#16a34a]" />}
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={el => fileInputRefs.current[key] = el}
                    onChange={(e) => handleFileChange(key, e.target.files[0])}
                  />
                </div>
              ))}
            </motion.div>
          )}

          {/* STEP 3: KONFIRMASI */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="bg-[#eef4ff] p-6 rounded-[24px] border border-[#c9d8ff]">
                <h4 className="font-black text-[#00236F] mb-4 flex items-center gap-2 tracking-wide"><Sparkles size={18} /> Ringkasan Pengajuan</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#a3a3a3] font-bold">Beasiswa</span>
                    <span className="font-black text-[#171717]">{scholarship.nama}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#a3a3a3] font-bold">Berkas Terunggah</span>
                    <span className="font-black text-[#16a34a]">{Object.keys(files).length} Berkas</span>
                  </div>
                  <div className="pt-3 border-t border-[#c9d8ff]">
                    <p className="text-[10px] font-black text-[#00236F] uppercase tracking-widest mb-1">Motivasi Preview</p>
                    <p className="text-sm text-[#171717] font-medium line-clamp-3 italic opacity-70">"{motivasi}"</p>
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-4 p-5 bg-[#fafafa] rounded-[24px] border border-[#e5e5e5] cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={agreed} 
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-[#d4d4d4] text-[#00236F] focus:ring-[#00236F] transition-all" 
                />
                <span className="text-xs font-bold text-[#525252] leading-relaxed uppercase tracking-tight group-hover:text-[#171717]">
                  Saya menyatakan bahwa seluruh data dan dokumen yang saya kirimkan adalah benar, asli, dan dapat dipertanggungjawabkan di hadapan verifikator beasiswa BKU.
                </span>
              </label>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-[#f5f5f5] flex justify-between items-center bg-[#fafafa]">
          {step > 1 ? (
            <button 
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-[#a3a3a3] hover:text-[#171717] transition-all"
            >
              <ArrowLeft size={18} /> Sebelumnya
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button 
              disabled={(step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid)}
              onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black bg-[#00236F] text-white hover:bg-[#0B4FAE] transition-all shadow-xl shadow-[#00236F]/20 disabled:opacity-30"
            >
              Lanjutkan <ArrowRight size={18} />
            </button>
          ) : (
            <button 
              disabled={!agreed || daftarMutation.isPending}
              onClick={handleSubmit}
              className="flex items-center gap-2 px-10 py-3.5 rounded-2xl font-black bg-[#00236F] text-white hover:bg-[#0B4FAE] transition-all shadow-xl shadow-[#00236F]/20 disabled:opacity-50"
            >
              {daftarMutation.isPending ? <><Loader2 size={18} className="animate-spin" /> Mengirim...</> : <><Check size={18} /> Kirim Pengajuan</>}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ======================== MAIN PAGE ========================
export default function ScholarshipPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('katalog'); // 'katalog' | 'riwayat'
  const [filters, setFilters] = useState({ kategori: 'Semua', sort: 'deadline_asc' });
  const [selectedSch, setSelectedSch] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const { data: katalog, isLoading: isCatalogLoading } = useScholarshipKatalogQuery(filters);
  const { data: riwayatResp, isLoading: isRiwayatLoading } = useScholarshipRiwayatQuery();
  
  const stats = riwayatResp?.stats || { total: 0, proses: 0, diterima: 0, ditolak: 0 };
  const riwayatList = riwayatResp?.data || [];

  return (
    <div className="px-4 py-5 md:px-6 md:py-6 lg:px-8 lg:py-8 font-body text-[#171717] min-h-screen bg-[#fafafa]">
      
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-headline tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 bg-[#00236F] rounded-xl flex items-center justify-center shadow-md shadow-[#00236F]/20">
              <GraduationCap className="text-white" size={20} />
            </div>
            Scholarship hub
          </h1>
          <p className="text-[#a3a3a3] mt-1.5 font-bold uppercase tracking-[0.16em] text-[10px]">Akses Beasiswa Internal & Eksternal BKU</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-white rounded-2xl shadow-sm border border-[#e5e5e5] w-fit">
          {[
            { id: 'katalog', label: 'Katalog Aktif', icon: LayoutGrid },
            { id: 'riwayat', label: 'Riwayat Saya', icon: History }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs md:text-sm transition-all ${
                activeTab === tab.id 
                  ? 'bg-[#00236F] text-white shadow-md shadow-[#00236F]/20' 
                  : 'text-[#a3a3a3] hover:text-[#525252]'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {activeTab === 'katalog' ? (
        <>
          {/* Filter Bar */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="flex flex-wrap items-center gap-3 mb-6 bg-white p-3.5 rounded-2xl border border-[#e5e5e5] shadow-sm"
          >
            <div className="flex items-center gap-2 px-4 border-r border-[#f5f5f5] mr-2">
              <Filter size={16} className="text-[#00236F]" />
              <span className="text-xs font-black text-[#171717] uppercase tracking-widest">Filters</span>
            </div>
            
            {['Semua', 'Internal', 'Alumni', 'Mitra'].map(cat => (
              <button 
                key={cat}
                onClick={() => setFilters(f => ({ ...f, kategori: cat }))}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                  filters.kategori === cat 
                    ? 'bg-[#eef4ff] text-[#00236F] border border-[#c9d8ff]' 
                    : 'bg-transparent text-[#a3a3a3] hover:text-[#525252]'
                }`}
              >
                {cat}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-2">
               <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Urutkan:</span>
                <select 
                 value={filters.sort}
                 onChange={(e) => setFilters(f => ({ ...f, sort: e.target.value }))}
                 className="bg-[#fafafa] border border-[#e5e5e5] rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#00236F]"
                >
                  <option value="deadline_asc">Deadline Terdekat</option>
                  <option value="nilai_desc">Bantuan Terbesar</option>
                </select>
             </div>
           </motion.div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isCatalogLoading ? (
              <CardGridSkeleton count={6} />
            ) : katalog?.length > 0 ? (
              katalog.map((beasiswa, idx) => {
                const daysLeft = getDaysLeft(beasiswa.deadline);
                const isUrgent = daysLeft < 14;

                return (
                  <motion.div 
                    key={beasiswa.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden hover:border-[#c9d8ff] hover:shadow-md transition-all flex flex-col relative"
                  >
                    <div className="p-4 md:p-5 pb-3 flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          beasiswa.kategori === 'Internal' ? 'bg-[#eef4ff] text-[#00236F] border-[#c9d8ff]' :
                          beasiswa.kategori === 'Alumni' ? 'bg-[#eff6ff] text-[#3b82f6] border-[#dbeafe]' :
                          'bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]'
                        }`}>
                          {beasiswa.kategori}
                        </span>
                        {isUrgent && (
                           <div className="flex items-center gap-1 text-[#dc2626] bg-red-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
                              <Clock size={12} /> Sisa {daysLeft} Hari
                           </div>
                        )}
                      </div>
                      
                      <h3 className="text-base md:text-lg font-black mb-1 leading-tight group-hover:text-[#00236F] transition-colors">{beasiswa.nama}</h3>
                      <p className="text-[11px] text-[#a3a3a3] font-bold uppercase tracking-wider mb-6">{beasiswa.penyelenggara}</p>
                      <p className="text-xs text-[#737373] leading-relaxed mb-4 line-clamp-2">{beasiswa.deskripsi}</p>

                      <div className="space-y-3 pt-3 border-t border-[#f5f5f5]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-[#f0fdf4] text-[#16a34a] rounded-xl flex items-center justify-center">
                              <Wallet size={18} />
                            </div>
                            <div>
                               <p className="text-[9px] font-black text-[#a3a3a3] uppercase tracking-widest">Nilai Bantuan</p>
                               <p className="text-sm font-black text-[#171717]">{formatRupiah(beasiswa.nilai_bantuan)}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-[#eef4ff] text-[#00236F] rounded-xl flex items-center justify-center">
                              <Users size={18} />
                            </div>
                            <div>
                               <p className="text-[9px] font-black text-[#a3a3a3] uppercase tracking-widest">Kuota</p>
                               <p className="text-sm font-black text-[#171717]">{beasiswa.sisa_kuota} <span className="text-[#a3a3a3] font-bold">/ {beasiswa.kuota}</span></p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 md:p-5 pt-0">
                      <button 
                        onClick={() => setSelectedSch(beasiswa)}
                        className="w-full bg-[#00236F] text-white py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-colors hover:bg-[#0B4FAE]"
                      >
                        Detail & Daftar <ArrowRight size={18} />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            ) : (
               <div className="col-span-full">
                 <EmptyState 
                   icon="Search" 
                   iconColor="text-[#00236F]"
                   iconBgClass="bg-[#eef4ff]"
                   iconBorderClass="border-[#c9d8ff]"
                   title="Beasiswa Tidak Ditemukan" 
                   description="Coba bersihkan filter atau pilih kategori lain."
                 />
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Diajukan', val: stats.total, color: 'text-[#171717]', bg: 'bg-white', icon: FileText },
               { label: 'Sedang Proses', val: stats.proses, color: 'text-[#00236F]', bg: 'bg-[#eef4ff]', icon: Clock },
              { label: 'Lulus Seleksi', val: stats.diterima, color: 'text-[#16a34a]', bg: 'bg-[#f0fdf4]', icon: Trophy },
              { label: 'Ditolak', val: stats.ditolak, color: 'text-[#dc2626]', bg: 'bg-[#fef2f2]', icon: X }
            ].map(s => (
              <div key={s.label} className={`${s.bg} p-4 rounded-2xl border border-[#e5e5e5] shadow-sm`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${s.bg === 'bg-white' ? 'bg-[#fafafa]' : 'bg-white'} ${s.color}`}>
                    <s.icon size={18} />
                  </div>
                  <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">{s.label}</span>
                </div>
                <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
              </div>
            ))}
          </div>

          {/* History Table */}
          <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#f4f8ff] border-b border-[#dbe7ff]">
                    <th className="px-4 md:px-6 py-3.5 text-[10px] font-black text-[#1E3A8A] uppercase tracking-[0.18em]">Nama Beasiswa</th>
                    <th className="px-4 md:px-6 py-3.5 text-[10px] font-black text-[#1E3A8A] uppercase tracking-[0.18em]">Ref. Number</th>
                    <th className="px-4 md:px-6 py-3.5 text-[10px] font-black text-[#1E3A8A] uppercase tracking-[0.18em] text-center">Tgl Daftar</th>
                    <th className="px-4 md:px-6 py-3.5 text-[10px] font-black text-[#1E3A8A] uppercase tracking-[0.18em] text-center">Tahap Sekarang</th>
                    <th className="px-4 md:px-6 py-3.5 text-[10px] font-black text-[#1E3A8A] uppercase tracking-[0.18em] text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5f5f5]">
                  {isRiwayatLoading ? (
                    <tr><td colSpan="5" className="p-8"><TableSkeleton rows={5} cols={5} /></td></tr>
                  ) : riwayatList.length > 0 ? (
                    riwayatList.map(item => {
                      const badge = STATUS_BADGE[item.status] || STATUS_BADGE.dikirim;
                      return (
                        <tr key={item.id} className="hover:bg-[#f7faff] transition-colors group">
                          <td className="px-4 md:px-6 py-3.5">
                            <div className="flex flex-col">
                               <p className="font-black text-[#171717]">{item.beasiswa?.nama}</p>
                               <p className="text-[10px] text-[#a3a3a3] font-bold uppercase tracking-wide">{item.beasiswa?.kategori} Beasiswa</p>
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-3.5">
                             <code className="text-[10px] font-bold bg-[#f5f5f5] px-2 py-1 rounded-lg text-[#525252]">{item.nomor_referensi}</code>
                          </td>
                          <td className="px-4 md:px-6 py-3.5 text-center">
                            <span className="text-sm font-bold text-[#525252]">
                              {new Date(item.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-3.5 text-center">
                             <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${badge.bg} ${badge.color} ${badge.border}`}>
                               {badge.label}
                             </span>
                          </td>
                          <td className="px-4 md:px-6 py-3.5 text-center">
                             <button 
                              onClick={() => {
                                if (item.id) {
                                  navigate(`/student/scholarship/pengajuan/${item.id}`);
                                } else {
                                  toast.error('ID Pengajuan tidak ditemukan');
                                }
                              }}
                              className="px-4 py-2 rounded-xl bg-white border border-[#e5e5e5] text-xs font-black hover:border-[#00236F] hover:text-[#00236F] transition-all flex items-center justify-center gap-2 mx-auto"
                             >
                               Lihat Progress <ChevronRight size={14} />
                             </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-12">
                        <EmptyState 
                          icon="History" 
                          iconColor="text-[#00236F]"
                          iconBgClass="bg-[#eef4ff]"
                          iconBorderClass="border-[#c9d8ff]"
                          title="Belum Ada Pendaftaran" 
                          description="Riwayat pengajuan beasiswa kamu akan muncul di sini." 
                          actionLabel="Buka Katalog"
                          actionClassName="bg-[#00236F] hover:bg-[#0B4FAE]"
                          onAction={() => setActiveTab('katalog')}
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL (Quick View) */}
      <AnimatePresence>
        {selectedSch && (
          <div className="fixed inset-0 z-50 bg-[#171717]/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="relative h-24 bg-gradient-to-r from-[#00236F] to-[#0B4FAE] p-5 flex items-center">
                 <button onClick={() => setSelectedSch(null)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
                   <X size={24} />
                 </button>
                 <div>
                    <h2 className="text-2xl font-black text-white pr-10">{selectedSch.nama}</h2>
                    <p className="text-[10px] text-white/50 font-black uppercase tracking-[0.3em] mt-1">{selectedSch.penyelenggara}</p>
                 </div>
              </div>
              
              <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="p-3.5 bg-[#fafafa] rounded-xl border border-[#e5e5e5]">
                    <p className="text-[9px] font-black text-[#a3a3a3] uppercase tracking-widest mb-1">Nilai Bantuan</p>
                    <p className="text-sm font-black text-[#00236F]">{formatRupiah(selectedSch.nilai_bantuan)}</p>
                  </div>
                  <div className="p-3.5 bg-[#fafafa] rounded-xl border border-[#e5e5e5]">
                    <p className="text-[9px] font-black text-[#a3a3a3] uppercase tracking-widest mb-1">Kuota Sisa</p>
                    <p className="text-sm font-black text-[#171717]">{selectedSch.sisa_kuota} <span className="text-[10px] text-[#a3a3a3]">Org</span></p>
                  </div>
                  <div className="p-3.5 bg-[#fafafa] rounded-xl border border-[#e5e5e5]">
                    <p className="text-[9px] font-black text-[#a3a3a3] uppercase tracking-widest mb-1">Min. IPK</p>
                    <p className="text-sm font-black text-[#171717]">{selectedSch?.syarat_ipk_min?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className={`p-3.5 rounded-xl border ${getDaysLeft(selectedSch.deadline) < 7 ? 'bg-red-50 border-red-200' : 'bg-[#fafafa] border-[#e5e5e5]'}`}>
                    <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${getDaysLeft(selectedSch.deadline) < 7 ? 'text-red-500' : 'text-[#a3a3a3]'}`}>Deadline</p>
                    <p className={`text-sm font-black ${getDaysLeft(selectedSch.deadline) < 7 ? 'text-red-600' : 'text-[#171717]'}`}>{new Date(selectedSch.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest mb-3"><Info size={16} className="text-[#00236F]" /> Deskripsi Program</h4>
                    <p className="text-sm text-[#525252] font-medium leading-relaxed">{selectedSch.deskripsi}</p>
                  </div>

                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest mb-3"><FileText size={16} className="text-[#00236F]" /> Persyaratan</h4>
                    <div className="bg-[#fafafa] p-6 rounded-[24px] border border-[#e5e5e5]">
                       <pre className="text-sm text-[#525252] font-medium whitespace-pre-line font-body leading-relaxed">
                         {selectedSch.persyaratan}
                       </pre>
                    </div>
                  </div>

                  <div>
                     <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest mb-3"><Sparkles size={16} className="text-[#00236F]" /> Tahapan Seleksi</h4>
                     <div className="flex items-center justify-between px-2 py-4">
                        {['Daftar', 'Berkas', 'Evaluasi', 'Review', 'Penetapan', 'Hasil'].map((s, i) => (
                           <div key={s} className="flex flex-col items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-[#00236F]' : 'bg-[#e5e5e5]'}`} />
                              <span className={`text-[8px] font-black uppercase tracking-tighter ${i === 0 ? 'text-[#171717]' : 'text-[#a3a3a3]'}`}>{s}</span>
                           </div>
                        ))}
                     </div>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-[#f5f5f5] flex gap-4 bg-[#fafafa]">
                <button 
                  onClick={() => setSelectedSch(null)}
                  className="flex-1 py-4 rounded-2xl font-black text-sm border border-[#e5e5e5] text-[#a3a3a3] hover:text-[#171717] transition-all"
                >
                  Tutup
                </button>
                <button 
                  onClick={() => setShowApplyModal(true)}
                  className="flex-1 py-4 rounded-2xl font-black text-sm bg-[#00236F] text-white hover:bg-[#0B4FAE] shadow-xl shadow-[#00236F]/20 transition-all hover:scale-[1.02]"
                >
                  Daftar Sekarang
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* APPLICATION WIZARD */}
      <AnimatePresence>
        {showApplyModal && (
          <ApplyWizard 
            scholarship={selectedSch} 
            onClose={() => setShowApplyModal(false)}
            onSuccess={() => {
              toast.success('Pendaftaran Berhasil Dikirim!');
              setShowApplyModal(false);
              setSelectedSch(null);
              setActiveTab('riwayat');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePengajuanDetailQuery } from '../../queries/useScholarshipQuery';
import { 
  ArrowLeft, CheckCircle2, Clock, XCircle, FileText, 
  Info, Download, Calendar, ExternalLink, ShieldCheck, 
  ChevronRight, Sparkles, Loader2, Award, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STAGES = [
  { key: 'dikirim', label: 'Pengajuan Dikirim', desc: 'Data pendaftaran pertama kali diterima oleh sistem.' },
  { key: 'seleksi_berkas', label: 'Seleksi Berkas', desc: 'Tim verifikator sedang memeriksa keabsahan dokumen.' },
  { key: 'evaluasi', label: 'Evaluasi & Wawancara', desc: 'Penilaian substansi dan sesi wawancara (jika ada).' },
  { key: 'review', label: 'Review Akhir', desc: 'Review kumulatif oleh jajaran pimpinan BKU.' },
  { key: 'penetapan', label: 'Penetapan Pemenang', desc: 'Penetapan final daftar penerima beasiswa.' },
  { key: 'hasil', label: 'Hasil Akhir', desc: 'Pengumuman resmi status penerimaan.' },
];

export default function ScholarshipDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = usePengajuanDetailQuery(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#f97316] mx-auto mb-4" size={48} />
          <p className="text-sm font-black text-[#a3a3a3] uppercase tracking-widest">Memuat Progress...</p>
        </div>
      </div>
    );
  }

  const { pengajuan, logs, berkas } = data || {};
  
  if (!pengajuan) return null;

  // Find current stage index
  const statusToStage = {
    dikirim: 0,
    seleksi_berkas: 1,
    evaluasi: 2,
    review: 3,
    penetapan: 4,
    diterima: 5,
    ditolak: 5
  };
  const currentStageIdx = statusToStage[pengajuan.status] || 0;
  const isFinal = pengajuan.status === 'diterima' || pengajuan.status === 'ditolak';

  return (
    <div className="p-6 md:p-10 font-body text-[#171717] min-h-screen bg-[#fafafa]">
      
      {/* Header */}
      <button 
        onClick={() => navigate('/student/scholarship')}
        className="group flex items-center gap-2 mb-8 text-[#a3a3a3] hover:text-[#171717] font-black uppercase tracking-widest text-[10px] transition-all"
      >
        <div className="w-8 h-8 rounded-xl border border-[#e5e5e5] group-hover:border-black flex items-center justify-center transition-all">
          <ArrowLeft size={16} />
        </div>
        Kembali ke Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Info & Tracker */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Main Info Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[40px] p-8 border border-[#e5e5e5] shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-50 to-transparent -mr-32 -mt-32 rounded-full blur-3xl opacity-50" />
            
            <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                   <div className="w-2 h-2 rounded-full bg-[#f97316] animate-pulse" />
                   <span className="text-[10px] font-black text-[#f97316] uppercase tracking-widest leading-none">Tracking Real-time</span>
                </div>
                <h1 className="text-3xl font-black font-headline tracking-tighter mb-1">{pengajuan.beasiswa?.nama}</h1>
                <p className="text-[11px] font-bold text-[#a3a3a3] uppercase tracking-[0.2em]">{pengajuan.beasiswa?.penyelenggara}</p>
                
                <div className="flex flex-wrap items-center gap-4 mt-6">
                  <div className="px-4 py-2 bg-[#fafafa] rounded-2xl border border-[#e5e5e5] flex items-center gap-2">
                    <Zap size={14} className="text-[#f97316]" />
                    <span className="text-xs font-black text-[#525252]">{pengajuan.nomor_referensi}</span>
                  </div>
                  <div className="px-4 py-2 bg-[#fafafa] rounded-2xl border border-[#e5e5e5] flex items-center gap-2">
                    <Calendar size={14} className="text-[#a3a3a3]" />
                    <span className="text-xs font-bold text-[#525252]">Terdaftar: {new Date(pengajuan.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Summary Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  <div className="p-4 bg-[#fafafa] rounded-2xl border border-[#e5e5e5]">
                    <p className="text-[9px] font-black text-[#a3a3a3] uppercase tracking-widest mb-1">Nilai Bantuan</p>
                    <p className="text-sm font-black text-[#f97316]">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(pengajuan?.beasiswa?.nilai_bantuan || 0)}
                    </p>
                  </div>
                  <div className="p-4 bg-[#fafafa] rounded-2xl border border-[#e5e5e5]">
                    <p className="text-[9px] font-black text-[#a3a3a3] uppercase tracking-widest mb-1">Min. IPK</p>
                    <p className="text-sm font-black text-[#171717]">{pengajuan?.beasiswa?.syarat_ipk_min?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className="p-4 bg-[#fafafa] rounded-2xl border border-[#e5e5e5]">
                    <p className="text-[9px] font-black text-[#a3a3a3] uppercase tracking-widest mb-1">Status Ekonomi</p>
                    <p className="text-sm font-black text-[#171717]">{pengajuan?.beasiswa?.is_berbasis_ekonomi ? 'Wajib SKTM' : 'Umum'}</p>
                  </div>
                  <div className="p-4 bg-[#fafafa] rounded-2xl border border-[#e5e5e5]">
                    <p className="text-[9px] font-black text-[#a3a3a3] uppercase tracking-widest mb-1">Kategori</p>
                    <p className="text-sm font-black text-[#171717]">{pengajuan?.beasiswa?.kategori || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center md:items-end justify-center">
                <div className={`px-8 py-4 rounded-[28px] border-2 ${
                  pengajuan.status === 'diterima' ? 'bg-green-50 border-green-200 text-green-600' : 
                  pengajuan.status === 'ditolak' ? 'bg-red-50 border-red-200 text-red-600' :
                  'bg-[#fff7ed] border-[#fed7aa] text-[#f97316]'
                }`}>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-center opacity-70 mb-1">Status Final</p>
                  <p className="text-xl font-black uppercase tracking-widest text-center">{pengajuan.status.replace('_', ' ')}</p>
                </div>
              </div>
            </div>

            {/* PIPELINE STEPPER (Vertical) */}
            <div className="mt-12 space-y-2">
              <h3 className="text-xs font-black text-[#a3a3a3] uppercase tracking-[0.3em] mb-8">Pipeline Seleksi</h3>
              
              <div className="relative">
                {/* Connecting Line */}
                <div className="absolute left-6 top-8 bottom-8 w-1 bg-[#f5f5f5]">
                   <motion.div 
                     initial={{ height: 0 }}
                     animate={{ height: `${(currentStageIdx / (STAGES.length - 1)) * 100}%` }}
                     className="w-full bg-[#f97316] relative transition-all duration-1000"
                   />
                </div>

                <div className="space-y-12">
                  {STAGES.map((s, idx) => {
                    const isCompleted = idx < currentStageIdx;
                    const isActive = idx === currentStageIdx;
                    const isRejected = s.key === 'hasil' && pengajuan.status === 'ditolak';

                    return (
                      <div key={s.key} className="flex gap-10 relative items-start group">
                         {/* Circle Indicator */}
                         <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center z-10 transition-all border-4 ${
                           isCompleted ? 'bg-green-500 border-green-100 text-white shadow-lg shadow-green-100' :
                           isActive ? (isRejected ? 'bg-red-500 border-red-100 text-white' : 'bg-[#f97316] border-orange-100 text-white shadow-xl shadow-orange-200 scale-110') :
                           'bg-white border-[#f5f5f5] text-[#d4d4d4]'
                         }`}>
                           {isCompleted ? <CheckCircle2 size={24} /> : (isRejected ? <XCircle size={24} /> : (idx + 1))}
                         </div>

                         <div className={`flex-1 transition-opacity ${!isCompleted && !isActive ? 'opacity-40' : 'opacity-100'}`}>
                            <div className="flex items-center gap-2 mb-1">
                               <p className={`text-lg font-black tracking-tight ${isActive ? 'text-[#171717]' : 'text-[#525252]'}`}>{s.label}</p>
                               {isActive && !isFinal && (
                                 <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                 </span>
                               )}
                            </div>
                            <p className="text-sm font-medium text-[#a3a3a3] leading-relaxed max-w-xl">{s.desc}</p>
                            
                            {/* Log per stage (latest relevant log) */}
                            {isActive && logs?.length > 0 && (
                              <motion.div 
                                initial={{ opacity: 0, x: -10 }} 
                                animate={{ opacity: 1, x: 0 }}
                                className="mt-4 p-5 bg-[#fafafa] rounded-[24px] border border-[#f5f5f5] flex gap-4"
                              >
                                <div className="p-2.5 bg-white rounded-xl shadow-sm border border-[#f5f5f5] text-[#f97316] shrink-0 h-fit">
                                   <Info size={20} />
                                </div>
                                <div>
                                   <p className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest mb-1">Catatan Verifikator</p>
                                   <p className="text-sm font-bold text-[#171717]">{logs[logs.length - 1].catatan_admin || 'Sedang dalam proses verifikasi substansi.'}</p>
                                   <p className="text-[9px] font-bold text-[#d4d4d4] mt-2 uppercase tracking-tighter">Diperbarui: {new Date(logs[logs.length - 1].created_at).toLocaleString('id-ID')}</p>
                                </div>
                              </motion.div>
                            )}
                         </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Docs & Details */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Motivation Snapshot */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#171717] p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden"
          >
             <div className="absolute bottom-0 right-0 p-4 opacity-10">
               <Zap size={120} strokeWidth={1} />
             </div>
             <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 mb-6 flex items-center gap-2"><Sparkles size={14} className="text-[#f97316]" /> Snapshot Motivasi</h4>
             <p className="text-sm font-medium leading-relaxed italic opacity-80 line-clamp-[10]">
               "{pengajuan.motivasi}"
             </p>
          </motion.div>

          {/* Files List */}
          <div className="bg-white p-8 rounded-[40px] border border-[#e5e5e5] shadow-sm">
             <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#a3a3a3] mb-6 flex items-center gap-2"><FileText size={16} className="text-[#f97316]" /> Dokumen Pendaftaran</h4>
             <div className="space-y-3">
                {berkas?.length > 0 ? berkas.map(file => (
                  <div key={file.id} className="group p-4 bg-[#fafafa] rounded-2xl border border-[#f5f5f5] flex items-center justify-between hover:border-[#f97316] transition-all">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-white rounded-xl border border-[#e5e5e5] group-hover:border-orange-200 flex items-center justify-center text-[#a3a3a3] group-hover:text-[#f97316]">
                         <Download size={18} />
                       </div>
                       <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-[#171717]">{file.tipe_berkas}</p>
                         <p className="text-[8px] font-bold text-[#a3a3a3]">PDF/JPG Document</p>
                       </div>
                    </div>
                    <a 
                      href={file.file_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="p-2 hover:bg-white rounded-lg text-[#a3a3a3] hover:text-[#171717] transition-all"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                )) : (
                  <p className="text-xs text-[#a3a3a3] italic">Tidak ada berkas ditemukan.</p>
                )}
             </div>
          </div>

          {/* Verified Badge Header */}
          <div className="bg-[#f0fdf4] p-8 rounded-[40px] border border-[#bbf7d0] flex flex-col items-center text-center">
             <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center text-[#16a34a] shadow-xl shadow-green-100 mb-4">
                <ShieldCheck size={32} />
             </div>
             <p className="text-sm font-black text-[#166534] tracking-tight mb-1 uppercase">Sistem BKU Student Hub</p>
             <p className="text-[10px] font-bold text-[#16a34a] opacity-80 uppercase tracking-widest">End-to-End Encryption & Verified Data</p>
          </div>

        </div>

      </div>
    </div>
  );
}

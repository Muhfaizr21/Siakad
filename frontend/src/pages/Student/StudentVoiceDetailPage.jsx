import React from 'react';
import { 
  ChevronLeft, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  FileText, 
  Download, 
  Info, 
  ArrowUpRight,
  ShieldCheck,
  Building,
  School,
  Ban,
  Calendar,
  Layers,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useParams, Link, NavLink } from 'react-router-dom';
import { useVoiceDetailQuery } from '../../queries/useStudentVoiceQuery';
import { Skeleton } from '../../components/ui/Skeleton';

export default function StudentVoiceDetailPage() {
  const { id } = useParams();
  const { data: ticket, isLoading, isError, error } = useVoiceDetailQuery(id);

  if (isLoading) return <DetailSkeleton />;
  if (isError || !ticket) return <ErrorView error={error} />;

  return (
    <div className="min-h-screen bg-[#f8f8f6] text-[#171717] font-body">
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm font-medium text-[#6b7280] mb-6">
            <NavLink to="/student/dashboard" className="hover:text-[#00236F] cursor-pointer transition-colors">Dashboard</NavLink>
            <ChevronLeft size={14} className="opacity-50" />
            <NavLink to="/student/voice" className="hover:text-[#00236F] cursor-pointer transition-colors">Suara Mahasiswa</NavLink>
            <ChevronLeft size={14} className="opacity-50" />
            <span className="text-[#171717] font-semibold">Detail Tiket</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Link 
                to="/student/voice"
                className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-[#00236F] hover:border-[#00236F] transition-all shadow-sm shrink-0 hover:-translate-x-0.5"
              >
                <ChevronLeft size={20} />
              </Link>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-[#00236F] text-white text-xs font-semibold rounded-md shadow-sm">
                    TICKET ID
                  </span>
                  <span className="text-xs font-medium text-gray-500">
                    {new Date(ticket.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <h1 className="text-xl md:text-2xl font-bold font-headline text-[#171717]">
                  {ticket.nomor_tiket}
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
               <div className="flex flex-col items-end hidden md:block mr-2 text-right">
                  <span className="text-xs font-medium text-gray-500 block mb-0.5">Status Aspirasi</span>
                  <span className="text-sm font-semibold text-[#171717]">Real-time Tracking</span>
               </div>
               <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border shadow-sm ${getCategoryStyle(ticket.kategori)}`}>
                 {ticket.kategori}
               </span>
               <LevelBadge level={ticket.level_saat_ini} />
               <StatusBadge status={ticket.status} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-start">
          {/* Left Column: Ticket Content */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm relative overflow-hidden"
            >
              {/* Header Content */}
              <div className="relative z-10">
                <div className="flex flex-col gap-4 mb-6">
                  {ticket.is_anonim && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg shrink-0 self-start">
                      <ShieldCheck size={16} className="text-gray-500" />
                      <span className="text-xs font-semibold text-gray-600">Dikirim secara Anonim</span>
                    </div>
                  )}
                <h2 className="text-xl md:text-2xl font-bold font-headline text-[#171717] leading-tight break-words">
                  {ticket.judul}
                </h2>
                </div>

                <div className="h-px w-full bg-gray-100 mb-6" />

                <div className="prose prose-neutral max-w-none mb-8 overflow-hidden">
                  <p className="text-sm md:text-base text-gray-700 leading-relaxed font-body whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                    {ticket.isi}
                  </p>
                </div>

                {ticket.respon && (
                  <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-100 overflow-hidden">
                    <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-2">Respons Admin</p>
                    <p className="text-sm text-blue-900 leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                      {ticket.respon}
                    </p>
                  </div>
                )}

                {ticket.lampiran_url && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 group/file">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 group-hover/file:text-[#00236F] transition-colors shadow-sm">
                          <FileText size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#171717]">Lampiran Pendukung</p>
                          <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mt-0.5">
                             <Download size={14} className="text-[#00236F]" /> File Attachment
                          </p>
                        </div>
                      </div>
                      <a 
                        href={`http://localhost:8000${ticket.lampiran_url}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#00236F] text-white font-medium rounded-xl hover:bg-[#0B4FAE] transition-colors text-sm"
                      >
                        Download <Download size={16} />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Guidelines Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl flex flex-col gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                  <Info size={20} />
                </div>
                <h4 className="text-sm font-bold text-blue-800">Proses Penyelesaian</h4>
                <p className="text-xs text-blue-700/80 leading-relaxed">
                  Aspirasi ini sedang dikelola oleh Unit Kerja terkait. Mohon menunggu respons resmi sistem.
                </p>
              </div>
              <div className="p-6 bg-[#00236F] border border-[#00236F] rounded-2xl flex flex-col gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white border border-white/20">
                  <ShieldCheck size={20} />
                </div>
                <h4 className="text-sm font-bold text-white">Kerahasiaan Data</h4>
                <p className="text-xs text-white/80 leading-relaxed">
                  Data pelapor dijaga kerahasiaannya dengan sistem enkripsi guna menjamin keamanan mahasiswa.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Journey Tracker */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-8 relative z-10">
                <h3 className="text-base font-bold font-headline text-[#171717] flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#00236F] rounded-full" />
                  Journey Tracker
                </h3>
                <Layers size={18} className="text-gray-300" />
              </div>

              <div className="relative pl-8 space-y-6 z-10">
                {/* Vertical Line Connector */}
                <div className="absolute left-[15px] top-4 bottom-6 w-0.5 bg-gray-100">
                   <motion.div 
                     initial={{ height: 0 }} 
                     animate={{ height: '100%' }}
                     transition={{ duration: 1, ease: "easeOut" }}
                     className="w-full bg-[#00236F]"
                   />
                </div>

                {/* Timeline Events */}
                {(ticket.timeline || []).map((event, idx) => (
                  <TimelineEvent 
                    key={event.id} 
                    event={event} 
                    isLatest={idx === 0} 
                    idx={idx}
                  />
                ))}

                {(!ticket.timeline || ticket.timeline.length === 0) && (
                  <div className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                    Belum ada riwayat proses untuk tiket ini.
                  </div>
                )}

                {/* Progress Goal */}
                {ticket.status !== 'selesai' && (
                  <div className="relative flex items-center gap-4 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-opacity">
                    <div className="absolute left-[-39px] w-8 h-8 rounded-full bg-white border-[3px] border-gray-200 flex items-center justify-center z-20">
                      <CheckCircle2 size={14} className="text-gray-300" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-gray-500">
                        Goal: Tiket Selesai
                      </h5>
                      <p className="text-[11px] font-medium text-gray-400 mt-0.5">Menunggu tindakan</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineEvent({ event, isLatest, idx }) {
  const config = getEventConfig(event.tipe_event);
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.1 }}
      className={`relative ${isLatest ? 'z-20' : 'z-10'}`}
    >
      {/* Icon Circle */}
      <div className={`absolute left-[-41px] w-8 h-8 rounded-full border-2 border-white flex items-center justify-center z-30 transition-transform shadow-sm ${config.circleColor}`}>
        <div className="text-white">
          {React.cloneElement(config.icon, { size: 14, strokeWidth: 2.5 })}
        </div>
      </div>

      <div className={`p-4 rounded-xl border transition-colors overflow-hidden ${isLatest ? 'bg-blue-50/30 border-blue-100 shadow-sm' : 'bg-white border-gray-100'}`}>
        <div className="flex flex-col gap-2 mb-3">
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${config.badgeStyle}`}>
              {config.label}
            </span>
            <span className="text-[10px] font-medium text-gray-500 flex items-center gap-1">
              <Clock size={12} className="text-[#00236F]" /> 
              {new Date(event.created_at).toLocaleTimeString('id-id', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
             <Calendar size={12} className="text-gray-400" />
             <p className="text-[11px] font-medium text-[#171717]">
               {new Date(event.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
             </p>
          </div>
        </div>

        {event.isi_respons && (
          <div className={`p-3 rounded-lg text-xs font-semibold leading-relaxed border italic relative whitespace-pre-wrap break-words [overflow-wrap:anywhere] ${config.msgStyle}`}>
             "{event.isi_respons}"
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-dashed border-gray-200 flex items-center justify-between">
           <div className="flex items-center gap-1.5">
              {event.level === 'sistem' ? <Building size={12} className="text-gray-400"/> : <ShieldAlert size={12} className="text-gray-400"/>}
              <span className="text-[10px] font-medium text-gray-500">
                Oleh {event.level === 'sistem' ? 'Sistem' : `Admin ${event.level.charAt(0).toUpperCase() + event.level.slice(1)}`}
              </span>
           </div>
           {isLatest && <div className="w-1.5 h-1.5 bg-[#00236F] rounded-full animate-pulse" />}
        </div>
      </div>
    </motion.div>
  );
}

function getEventConfig(type) {
  switch (type) {
    case 'dikirim':
      return { 
        label: 'Terkirim', 
        icon: <ArrowUpRight />, 
        circleColor: 'bg-[#00236F]', 
        badgeStyle: 'bg-blue-50 text-blue-600 border-blue-100',
        msgStyle: 'bg-gray-50 text-gray-600 border-gray-100'
      };
    case 'diterima_fakultas':
      return { 
        label: 'Diterima Fakultas', 
        icon: <Building />, 
        circleColor: 'bg-[#0B4FAE]', 
        badgeStyle: 'bg-blue-50 text-blue-600 border-blue-100',
        msgStyle: 'bg-blue-50/50 text-blue-800 border-blue-100'
      };
    case 'respons_fakultas':
      return { 
        label: 'Feedback Fakultas', 
        icon: <MessageSquare />, 
        circleColor: 'bg-blue-500', 
        badgeStyle: 'bg-blue-100 text-blue-700 border-blue-200',
        msgStyle: 'bg-blue-50 border-blue-100 text-blue-800'
      };
    case 'diteruskan_universitas':
      return { 
        label: 'Eskalasi Universitas', 
        icon: <School />, 
        circleColor: 'bg-indigo-500', 
        badgeStyle: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        msgStyle: 'bg-indigo-50/50 text-indigo-800 border-indigo-100'
      };
    case 'respons_universitas':
      return { 
        label: 'Feedback Universitas', 
        icon: <MessageSquare />, 
        circleColor: 'bg-indigo-600', 
        badgeStyle: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        msgStyle: 'bg-indigo-50 border-indigo-100 text-indigo-800'
      };
    case 'selesai':
      return { 
        label: 'Selesai', 
        icon: <CheckCircle2 />, 
        circleColor: 'bg-green-500', 
        badgeStyle: 'bg-green-50 text-green-600 border-green-100',
        msgStyle: 'bg-green-50 border-green-100 text-green-800'
      };
    case 'dibatalkan':
      return { 
        label: 'Dibatalkan', 
        icon: <Ban />, 
        circleColor: 'bg-red-500', 
        badgeStyle: 'bg-red-50 text-red-600 border-red-100',
        msgStyle: 'bg-red-50 border-red-100 text-red-800'
      };
    default:
      return { label: 'Status', icon: <Clock />, circleColor: 'bg-gray-400', badgeStyle: 'bg-gray-50 text-gray-500 border-gray-100' };
  }
}

function LevelBadge({ level }) {
  const styles = {
    fakultas: 'bg-blue-50 text-blue-700 border-blue-200',
    universitas: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    selesai: 'bg-green-50 text-green-700 border-green-200'
  };
  return (
    <span className={`px-3 py-1 rounded-lg text-xs font-bold border shadow-sm ${styles[level] || styles.selesai}`}>
      {level === 'selesai' ? 'Tercapai' : `Unit: ${level.charAt(0).toUpperCase() + level.slice(1)}`}
    </span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    menunggu: 'bg-gray-50 text-gray-600 border-gray-200',
    diproses: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    ditindaklanjuti: 'bg-blue-50 text-blue-700 border-blue-200',
    selesai: 'bg-green-50 text-green-700 border-green-200'
  };
  return (
    <span className={`px-3 py-1 rounded-lg text-xs font-bold border shadow-sm capitalize ${styles[status] || styles.menunggu}`}>
      {status}
    </span>
  );
}

const getCategoryStyle = (cat) => {
  const styles = {
    Akademik: 'bg-blue-50 text-blue-700 border-blue-200',
    Fasilitas: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Kemahasiswaan: 'bg-sky-50 text-sky-700 border-sky-200',
    'Saran & Ide': 'bg-teal-50 text-teal-700 border-teal-200'
  };
  return styles[cat] || 'bg-gray-50 text-gray-600 border-gray-200';
};

function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#f8f8f6] p-6 md:p-10 space-y-8 animate-pulse">
      <div className="max-w-5xl mx-auto space-y-4">
        <Skeleton className="h-6 w-32 rounded-lg" />
        <div className="flex justify-between items-center">
           <Skeleton className="h-12 w-64 rounded-xl" />
           <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
        <div className="lg:col-span-1 space-y-6">
           <Skeleton className="h-[300px] w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function ErrorView({ error }) {
  const message = error?.status === 500 
    ? "Terjadi kesalahan sistem saat memuat data."
    : (error?.message || "Data tiket tidak ditemukan atau akses ditolak.");
    
  return (
    <div className="min-h-screen bg-[#f8f8f6] flex flex-col items-center justify-center p-6 text-center font-body">
       <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-gray-100">
          <MessageSquare size={32} className="text-gray-400" />
       </div>
       <h2 className="text-xl md:text-2xl font-bold font-headline text-[#171717] mb-3">
          {error?.status === 500 ? "Kesalahan Sistem" : "Data Tidak Ditemukan"}
       </h2>
       <p className="text-gray-500 font-medium max-w-sm mb-8 text-sm">
         {message}
       </p>
       <div className="flex items-center gap-3">
         <Link 
           to="/student/voice" 
           className="px-6 py-2.5 bg-[#171717] text-white font-medium rounded-xl hover:bg-[#333] transition-colors text-sm"
         >
           Kembali ke Riwayat
         </Link>
         <button 
           onClick={() => window.location.reload()}
           className="px-6 py-2.5 bg-white border border-gray-200 text-[#171717] font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm"
         >
           Coba Lagi
         </button>
       </div>
    </div>
  );
}

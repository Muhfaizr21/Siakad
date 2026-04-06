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
  User,
  ShieldCheck,
  Building,
  School,
  Ban
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { useVoiceDetailQuery } from '../../queries/useStudentVoiceQuery';
import { Skeleton } from '../../components/ui/Skeleton';

export default function StudentVoiceDetailPage() {
  const { id } = useParams();
  const { data: ticket, isLoading, isError } = useVoiceDetailQuery(id);

  if (isLoading) return <DetailSkeleton />;
  if (isError || !ticket) return <ErrorView />;

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#171717] font-body p-6 md:p-10">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <Link 
            to="/student/voice"
            className="w-12 h-12 bg-white border border-[#e5e5e5] rounded-2xl flex items-center justify-center text-[#a3a3a3] hover:text-[#f97316] hover:border-[#f97316] transition-all shadow-sm group"
          >
            <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-[#a3a3a3] mb-1">
              <span>Student Voice</span>
              <span className="opacity-40">/</span>
              <span className="text-[#171717]">Detail Tiket</span>
            </div>
            <h1 className="text-2xl font-black font-headline tracking-tighter uppercase">{ticket.nomor_tiket}</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getCategoryStyle(ticket.kategori)}`}>
            {ticket.kategori}
          </span>
          <LevelBadge level={ticket.level_saat_ini} />
          <StatusBadge status={ticket.status} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Ticket Content */}
        <div className="lg:col-span-7 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[32px] p-10 border border-[#e5e5e5] shadow-sm relative overflow-hidden"
          >
            <div className="flex items-start justify-between mb-8">
              <h2 className="text-3xl font-black font-headline tracking-tight max-w-lg leading-tight uppercase">
                {ticket.judul}
              </h2>
              {ticket.is_anonim && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl">
                  <ShieldCheck size={16} className="text-[#a3a3a3]" />
                  <span className="text-[10px] font-black uppercase text-[#a3a3a3]">Anonim</span>
                </div>
              )}
            </div>

            <p className="text-lg text-[#525252] leading-relaxed mb-10 whitespace-pre-wrap font-medium">
              {ticket.isi}
            </p>

            {ticket.lampiran_url && (
              <div className="p-6 bg-[#fafafa] rounded-2xl border border-[#e5e5e5] flex items-center justify-between group/file hover:border-[#f97316] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl border border-[#e5e5e5] flex items-center justify-center text-[#a3a3a3] group-hover/file:text-[#f97316] transition-colors shadow-inner">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-[#171717] tracking-tight">Lampiran Pendukung</p>
                    <p className="text-[10px] font-bold text-[#a3a3a3] uppercase tracking-widest">Document / Image Attachment</p>
                  </div>
                </div>
                <a 
                  href={`http://localhost:8000${ticket.lampiran_url}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#e5e5e5] rounded-xl text-xs font-black text-[#171717] hover:bg-[#171717] hover:text-white transition-all shadow-sm"
                >
                  DOWNLOAD <Download size={16} />
                </a>
              </div>
            )}
            
            <MessageSquare size={200} className="absolute right-[-40px] top-[-40px] text-[#fafafa] pointer-events-none -rotate-12" />
          </motion.div>

          {/* Privacy Note */}
          <div className="p-8 bg-blue-50 border border-blue-100 rounded-3xl flex gap-6">
            <Info size={24} className="text-[#3b82f6] shrink-0" />
            <div>
              <h4 className="text-sm font-black text-[#1e40af] uppercase tracking-widest mb-1">Informasi Privasi & Keamanan</h4>
              <p className="text-xs font-semibold text-blue-900/60 leading-relaxed">
                Suara Anda berharga bagi kami. Tim Admin Fakultas dan Universitas berkomitmen untuk merespons 
                setiap aspirasi secara jujur & profesional dalam waktu maksimal 3x24 jam kerja.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Vertical Timeline Stepper */}
        <div className="lg:col-span-5">
          <div className="sticky top-8">
            <h3 className="text-xl font-black font-headline tracking-widest mb-10 flex items-center gap-3">
              JOURNEY TRACKER
              <div className="h-1 flex-1 bg-gradient-to-r from-[#e5e5e5] to-transparent rounded-full" />
            </h3>

            <div className="relative pl-10 space-y-12">
              {/* Vertical Line Connector */}
              <div className="absolute left-[19px] top-4 bottom-4 w-1 bg-gradient-to-b from-[#f97316] to-[#e5e5e5] rounded-full" />

              {/* Timeline Events */}
              {ticket.timeline?.map((event, idx) => (
                <TimelineEvent 
                  key={event.id} 
                  event={event} 
                  isLatest={idx === 0} 
                />
              ))}

              {/* End of Journey Indicator */}
              {ticket.status !== 'selesai' && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="relative flex items-center gap-6"
                >
                  <div className="absolute left-[-21px] w-10 h-10 rounded-full bg-white border-4 border-[#e5e5e5] flex items-center justify-center animate-pulse">
                    <div className="w-2 h-2 bg-[#a3a3a3] rounded-full" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-[#a3a3a3] uppercase tracking-widest">
                      {ticket.level_saat_ini === 'fakultas' ? 'Menunggu Penanganan Fakultas' : 'Menunggu Penanganan Universitas'}
                    </h5>
                    <p className="text-[10px] font-bold text-[#d4d4d4] uppercase tracking-widest mt-1 italic">
                      ESTIMATED: 1-2 WORKING DAYS
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineEvent({ event, isLatest }) {
  const config = getEventConfig(event.tipe_event);
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`relative ${isLatest ? 'scale-105 origin-left' : 'opacity-60'}`}
    >
      {/* Icon Circle */}
      <div className={`absolute left-[-31px] w-6 h-6 rounded-full border-4 border-white shadow-md flex items-center justify-center z-10 ${config.circleColor}`}>
        {config.icon}
      </div>

      <div className={`p-6 rounded-3xl border shadow-sm transition-all duration-500 ${isLatest ? 'bg-white shadow-xl shadow-black/5 ring-4 ring-orange-500/5' : 'bg-white/50 shadow-none'}`}>
        <div className="flex items-center justify-between mb-4">
          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${config.badgeStyle}`}>
            {config.label}
          </span>
          <span className="text-[10px] font-bold text-[#a3a3a3] flex items-center gap-1">
            <Clock size={10} /> {new Date(event.created_at).toLocaleTimeString('id-id', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <p className="text-xs font-black text-[#171717] leading-tight mb-2 tracking-tight">
          {new Date(event.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        {event.isi_respons && (
          <div className={`mt-4 p-4 rounded-2xl text-xs font-semibold leading-relaxed border italic ${config.msgStyle}`}>
             "{event.isi_respons}"
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-[#f5f5f5] flex items-center gap-2">
           {event.level === 'sistem' ? <Building size={12} className="text-[#a3a3a3]"/> : <ShieldAlert size={12} className="text-[#a3a3a3]"/>}
           <span className="text-[9px] font-black text-[#a3a3a3] uppercase tracking-tighter">
             By: {event.level === 'sistem' ? 'BKU Automated System' : `Admin ${event.level}`}
           </span>
        </div>
      </div>
    </motion.div>
  );
}

function getEventConfig(type) {
  switch (type) {
    case 'dikirim':
      return { 
        label: 'Aspirasi Terkirim', 
        icon: <ArrowUpRight size={10} className="text-white"/>, 
        circleColor: 'bg-[#f97316]', 
        badgeStyle: 'bg-orange-50 text-orange-600',
        msgStyle: 'bg-[#fafafa] text-[#a3a3a3]'
      };
    case 'diterima_fakultas':
      return { 
        label: 'Diterima Fakultas', 
        icon: <Building size={10} className="text-white"/>, 
        circleColor: 'bg-blue-500', 
        badgeStyle: 'bg-blue-50 text-blue-600',
        msgStyle: 'bg-blue-50/30'
      };
    case 'respons_fakultas':
      return { 
        label: 'Feedback Fakultas', 
        icon: <MessageSquare size={10} className="text-white"/>, 
        circleColor: 'bg-[#3b82f6]', 
        badgeStyle: 'bg-blue-50 text-blue-600',
        msgStyle: 'bg-blue-50 border-blue-100 text-blue-900/80 shadow-inner'
      };
    case 'diteruskan_universitas':
      return { 
        label: 'Eskalasi Universitas', 
        icon: <School size={10} className="text-white"/>, 
        circleColor: 'bg-purple-500', 
        badgeStyle: 'bg-purple-50 text-purple-600',
        msgStyle: 'bg-purple-50/30'
      };
    case 'respons_universitas':
      return { 
        label: 'Feedback Universitas', 
        icon: <MessageSquare size={10} className="text-white"/>, 
        circleColor: 'bg-purple-600', 
        badgeStyle: 'bg-purple-50 text-purple-600',
        msgStyle: 'bg-purple-50 border-purple-100 text-purple-900/80 shadow-inner'
      };
    case 'selesai':
      return { 
        label: 'Tiket Ditutup', 
        icon: <CheckCircle2 size={10} className="text-white"/>, 
        circleColor: 'bg-green-500', 
        badgeStyle: 'bg-green-50 text-green-600',
        msgStyle: 'bg-green-50 border-green-100 text-green-900/80'
      };
    case 'dibatalkan':
      return { 
        label: 'Dibatalkan', 
        icon: <Ban size={10} className="text-white"/>, 
        circleColor: 'bg-red-500', 
        badgeStyle: 'bg-red-50 text-red-600',
        msgStyle: 'bg-red-50 border-red-100'
      };
    default:
      return { label: 'Event', icon: <Clock size={10}/>, circleColor: 'bg-gray-400', badgeStyle: 'bg-gray-50' };
  }
}

function LevelBadge({ level }) {
  const styles = {
    fakultas: 'bg-blue-50 text-blue-600 border-blue-100',
    universitas: 'bg-purple-50 text-purple-600 border-purple-100',
    selesai: 'bg-gray-50 text-gray-400 border-gray-100'
  };
  return (
    <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${styles[level]}`}>
      Level: {level}
    </span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    menunggu: 'bg-gray-100 text-gray-500 border-gray-200',
    diproses: 'bg-orange-50 text-orange-600 border-orange-100',
    ditindaklanjuti: 'bg-blue-50 text-blue-600 border-blue-100',
    selesai: 'bg-green-50 text-green-600 border-green-100'
  };
  return (
    <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${styles[status]}`}>
      {status}
    </span>
  );
}

const getCategoryStyle = (cat) => {
  const styles = {
    Akademik: 'bg-blue-50 text-blue-600 border-blue-100',
    Fasilitas: 'bg-orange-50 text-orange-600 border-orange-100',
    Kemahasiswaan: 'bg-purple-50 text-purple-600 border-purple-100',
    'Saran & Ide': 'bg-green-50 text-green-600 border-green-100'
  };
  return styles[cat] || 'bg-gray-50 text-gray-500';
};

function DetailSkeleton() {
  return (
    <div className="p-10 max-w-6xl mx-auto space-y-10">
      <Skeleton className="h-20 w-1/2 rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-8">
           <Skeleton className="h-96 w-full rounded-[32px]" />
        </div>
        <div className="lg:col-span-5 space-y-8">
           <Skeleton className="h-32 w-full rounded-[32px]" />
           <Skeleton className="h-32 w-full rounded-[32px]" />
           <Skeleton className="h-32 w-full rounded-[32px]" />
        </div>
      </div>
    </div>
  );
}

function ErrorView() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-10 text-center">
       <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[32px] flex items-center justify-center mb-8 border border-red-100 shadow-xl shadow-red-500/10">
          <Trash2 size={40} />
       </div>
       <h2 className="text-3xl font-black font-headline tracking-tighter mb-4 uppercase">Data Tidak Ditemukan</h2>
       <p className="text-[#a3a3a3] font-bold max-w-xs mx-auto mb-10 leading-relaxed uppercase text-xs tracking-widest">
         Tiket aspirasi yang kamu cari mungkin sudah dihapus atau kamu tidak memiliki akses untuk melihatnya.
       </p>
       <Link to="/student/voice" className="px-10 py-5 bg-[#171717] text-white font-black rounded-3xl hover:bg-black transition-all shadow-2xl">
         KEMBALI KE RIWAYAT
       </Link>
    </div>
  );
}

function DetailStat({ label, value, unit }) {
  return (
    <div className="space-y-1">
      <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">{label}</span>
      <p className="text-xl font-black text-[#171717] tabular-nums">{value} <span className="text-[10px] text-[#d4d4d4] uppercase">{unit}</span></p>
    </div>
  );
}

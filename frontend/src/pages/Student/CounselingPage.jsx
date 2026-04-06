import React, { useState } from 'react';
import { 
  HeartHandshake, 
  BookOpen, 
  Briefcase, 
  Heart, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  User, 
  Clock, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight,
  Trash2
} from 'lucide-react';
import { 
  useCounselingJadwalQuery, 
  useCounselingRiwayatQuery, 
  useBookingMutation, 
  useCancelBookingMutation 
} from '../../queries/useCounselingQuery';
import { CardGridSkeleton, NotifListSkeleton } from '../../components/ui/SkeletonGroups';
import EmptyState from '../../components/ui/EmptyState';
import { toast } from 'react-hot-toast';
import { NavLink } from 'react-router-dom';

// Utility to format date
const formatLongDate = (dateStr) => {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr));
};

export default function CounselingPage() {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [keluhan, setKeluhan] = useState("");
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [filterTipe, setFilterTipe] = useState('Semua');

  // Queries
  const { data: jadwal, isLoading: isJadwalLoading } = useCounselingJadwalQuery();
  const { data: riwayat, isLoading: isRiwayatLoading } = useCounselingRiwayatQuery();
  
  // Mutations
  const bookingMutation = useBookingMutation();
  const cancelMutation = useCancelBookingMutation();

  const handleBooking = () => {
    if (!privacyAgreed) {
      toast.error("Harap setujui pernyataan privasi");
      return;
    }
    if (keluhan.length < 20) {
      toast.error("Ceritakan topik minimal 20 karakter");
      return;
    }

    bookingMutation.mutate({
      jadwal_id: selectedSlot.ID,
      keluhan_awal: keluhan
    }, {
      onSuccess: () => {
        toast.success("Booking berhasil diajukan!");
        setSelectedSlot(null);
        setKeluhan("");
        setPrivacyAgreed(false);
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Gagal melakukan booking");
      }
    });
  };

  const handleCancel = (id) => {
    if (confirm("Apakah kamu yakin ingin membatalkan jadwal konseling ini?")) {
      cancelMutation.mutate(id, {
        onSuccess: () => toast.success("Berhasil dibatalkan"),
        onError: () => toast.error("Gagal membatalkan booking")
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#171717] font-body p-6 md:p-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-medium text-[#a3a3a3] mb-8">
        <NavLink to="/student/dashboard" className="hover:text-[#f97316] cursor-pointer transition-colors">Dashboard</NavLink>
        <ChevronRight size={16} />
        <span className="text-[#171717]">Counseling & Wellness</span>
      </div>

      {/* Hero Section */}
      <div className="bg-[#171717] rounded-3xl p-8 md:p-12 text-white shadow-xl mb-12 overflow-hidden relative">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#f97316]/20 text-[#f97316] rounded-full text-xs font-bold mb-6 border border-[#f97316]/30">
            <ShieldCheck size={14} />
            Privasi Terjamin 100%
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold font-headline mb-4">Layanan Konseling Mahasiswa</h1>
          <p className="text-[#a3a3a3] text-lg mb-0 leading-relaxed font-medium">
            Kami hadir untuk mendukung kesehatan mental dan kelancaran studimu. <br className="hidden md:block" /> Sesi privat bersama konselor profesional BKU bersifat rahasia dan sukarela.
          </p>
        </div>
        <HeartHandshake size={240} className="absolute right-[-40px] bottom-[-40px] text-white opacity-5 pointer-events-none" />
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {[
          { 
            title: "Konseling Akademik", 
            icon: <BookOpen className="text-[#f97316]" size={28} />, 
            desc: "Bimbingan motivasi belajar, strategi studi, dan perencanaan masa depan akademik.",
            bgColor: "bg-[#fff7ed]"
          },
          { 
            title: "Konseling Karir", 
            icon: <Briefcase className="text-[#3b82f6]" size={28} />, 
            desc: "Konsultasi minat bakat, persiapan kerja, dan pengembangan potensi diri.",
            bgColor: "bg-[#eff6ff]"
          },
          { 
            title: "Konseling Personal", 
            icon: <Heart className="text-[#ef4444]" size={28} />, 
            desc: "Pendampingan kesehatan mental, masalah keluarga, dan pengembangan kepribadian.",
            bgColor: "bg-[#fef2f2]"
          }
        ].map((card, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl border border-[#e5e5e5] hover:shadow-lg transition-all border-b-4 border-b-[#f97316]/10">
            <div className={`w-14 h-14 ${card.bgColor} rounded-2xl flex items-center justify-center mb-6`}>
              {card.icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{card.title}</h3>
            <p className="text-[#525252] text-sm leading-relaxed font-medium">{card.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Schedule List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
             <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
                Jadwal Tersedia
                <span className="text-sm font-bold text-[#f97316] bg-[#fff7ed] px-2 py-0.5 rounded-lg border border-[#fed7aa] ml-2">Live</span>
             </h2>
             {/* Filter Kategori */}
             <div className="flex gap-2 flex-wrap">
               {['Semua', 'Akademik', 'Karir', 'Personal'].map((tipe) => (
                 <button
                   key={tipe}
                   onClick={() => setFilterTipe(tipe)}
                   className={`px-4 py-1.5 rounded-xl text-sm font-bold border transition-all ${
                     filterTipe === tipe
                       ? 'bg-[#f97316] text-white border-[#f97316] shadow-sm'
                       : 'bg-white text-[#525252] border-[#e5e5e5] hover:border-[#f97316]'
                   }`}
                 >
                   {tipe}
                 </button>
               ))}
             </div>
          </div>

          {/* filtered list */}
          {(() => {
            const filtered = jadwal?.filter(s => filterTipe === 'Semua' || s.Tipe === filterTipe) ?? [];
            return (
          <div className="space-y-4">
            {isJadwalLoading ? (
              <CardGridSkeleton count={4} />
            ) : filtered.length > 0 ? (
              filtered.map((slot) => (
                <div key={slot.ID} className="bg-white p-6 rounded-2xl border border-[#e5e5e5] hover:border-[#f97316] hover:shadow-md transition group flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        slot.Tipe === 'Akademik' ? 'bg-[#fff7ed] text-[#ea580c]' : 
                        slot.Tipe === 'Karir' ? 'bg-[#eff6ff] text-[#3b82f6]' : 
                        'bg-[#fef2f2] text-[#ef4444]'
                      }`}>
                        {slot.Tipe}
                      </span>
                      <span className="text-[10px] bg-[#fafafa] text-[#a3a3a3] px-2 py-1 rounded-full border border-[#e5e5e5] font-bold uppercase">
                         Kuota: {slot.SisaKuota}/{slot.Kuota}
                      </span>
                    </div>
                    <h4 className="font-bold text-lg mb-3">{slot.NamaKonselor}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-[#525252] font-medium">
                      <span className="flex items-center gap-2"><Calendar size={16} className="text-[#a3a3a3]"/> {formatLongDate(slot.Tanggal)}</span>
                      <span className="flex items-center gap-2"><Clock size={16} className="text-[#a3a3a3]"/> {slot.JamMulai} - {slot.JamSelesai} WIB</span>
                      <span className="flex items-center gap-2 sm:col-span-2"><MapPin size={16} className="text-[#a3a3a3]"/> {slot.Lokasi}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedSlot(slot)}
                    className="bg-white border-2 border-[#e5e5e5] hover:border-[#f97316] group-hover:bg-[#f97316] group-hover:text-white px-8 py-3 rounded-xl font-bold whitespace-nowrap transition-all shadow-sm"
                  >
                    Booking
                  </button>
                </div>
              ))
            ) : (
              <EmptyState 
                icon="HeartHandshake" 
                title="Antrean Penuh / Tidak Ada Jadwal" 
                description={filterTipe === 'Semua' ? 'Saat ini belum ada jadwal konseling yang tersedia. Silakan cek kembali beberapa saat lagi.' : `Jadwal untuk kategori ${filterTipe} sedang kosong.`}
              />
            )}
          </div>
            );
          })()}
        </div>

        {/* Right: History Section */}
        <div className="space-y-6">
           <h2 className="text-2xl font-bold font-headline">Riwayat Konseling</h2>
           <div className="space-y-4">
              {isRiwayatLoading ? (
                 <NotifListSkeleton count={4} />
              ) : riwayat?.length > 0 ? (
                riwayat.map((history) => (
                  // ...existing mapping...
                  <div key={history.id} className="bg-white p-5 rounded-2xl border border-[#e5e5e5] shadow-sm relative overflow-hidden">
                    {/* ... existing card content ... */}
                     <div className={`absolute top-0 left-0 w-1 h-full ${
                       history.status === 'Selesai' ? 'bg-[#16a34a]' :
                       history.status === 'Dikonfirmasi' ? 'bg-[#3b82f6]' :
                       history.status === 'Menunggu' ? 'bg-[#f97316]' : 'bg-[#a3a3a3]'
                     }`} />
                     
                     <div className="flex justify-between items-start mb-3">
                        <div>
                           <p className="text-[10px] font-bold text-[#a3a3a3] uppercase mb-1">{formatLongDate(history.tanggal)}</p>
                           <h5 className="font-bold text-[15px]">{history.tipe}</h5>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                           history.status === 'Selesai' ? 'bg-[#f0fdf4] text-[#16a34a]' :
                           history.status === 'Dikonfirmasi' ? 'bg-[#eff6ff] text-[#3b82f6]' :
                           history.status === 'Menunggu' ? 'bg-[#fff7ed] text-[#ea580c]' : 'bg-[#fafafa] text-[#a3a3a3]'
                        }`}>
                           {history.status}
                        </span>
                     </div>
                     
                     <p className="text-xs font-semibold text-[#525252] mb-4 flex items-center gap-1.5 line-clamp-1">
                        <User size={14} className="text-[#a3a3a3]"/> {history.nama_konselor}
                     </p>

                     <div className="flex items-center justify-between border-t border-[#f5f5f5] pt-3 mt-3">
                        <span className="text-[11px] font-bold text-[#a3a3a3] uppercase flex items-center gap-1">
                           <Clock size={12}/> {history.jam_mulai}
                        </span>
                        {history.status === 'Menunggu' && (
                           <button 
                              onClick={() => handleCancel(history.id)}
                              className="text-[#ef4444] hover:text-white hover:bg-[#ef4444] p-1.5 rounded transition-all"
                              title="Batalkan Antrean"
                           >
                              <Trash2 size={16} />
                           </button>
                        )}
                     </div>
                  </div>
                ))
              ) : (
                <EmptyState 
                  size="sm"
                  icon="Clock" 
                  title="Belum Ada Riwayat" 
                  description="Riwayat sesi konseling kamu akan muncul di sini." 
                />
              )}
           </div>
        </div>
      </div>

      {/* BOOKING MODAL */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 bg-[#171717]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#171717] p-8 text-white relative">
               <button onClick={() => setSelectedSlot(null)} className="absolute top-6 right-6 text-[#a3a3a3] hover:text-white transition-colors">
                  <X size={28}/>
               </button>
               <h2 className="text-2xl font-extrabold font-headline mb-2">Konfirmasi Booking</h2>
               <p className="text-[#a3a3a3] text-sm font-medium tracking-wide flex items-center gap-2">
                 <ShieldCheck size={16} className="text-[#16a34a]"/> Sesi Anda dilindungi Protokol Rahasia
               </p>
            </div>

            <div className="p-8">
               {/* Slot Summary */}
               <div className="bg-[#fafafa] border border-[#e5e5e5] rounded-2xl p-4 mb-8 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-bold text-[#a3a3a3] uppercase tracking-widest">
                     <span>{selectedSlot.Tipe}</span>
                     <span>{new Date(selectedSlot.Tanggal).toLocaleDateString('id-ID')}</span>
                  </div>
                  <h4 className="font-bold text-lg text-[#171717]">{selectedSlot.NamaKonselor}</h4>
                  <p className="text-xs font-bold text-[#f97316]">{selectedSlot.JamMulai} - {selectedSlot.JamSelesai} WIB</p>
               </div>

               <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-[#525252] mb-2 uppercase tracking-wide">Topik Pembahasan <span className="text-red-500">*</span></label>
                    <textarea 
                      value={keluhan}
                      onChange={(e) => setKeluhan(e.target.value)}
                      className="w-full h-32 bg-[#fafafa] border border-[#e5e5e5] rounded-2xl p-4 focus:ring-0 focus:border-[#f97316] outline-none text-sm transition-all shadow-inner"
                      placeholder="Contoh: Saya merasa kesulitan mengatur waktu belajar..."
                    />
                    <p className="text-[10px] text-[#a3a3a3] font-bold mt-1 uppercase tracking-tight">Minimal 20 karakter untuk mempermudah konselor</p>
                  </div>

                  <div className="p-4 bg-[#eff6ff] rounded-2xl border border-[#dbeafe] flex gap-3">
                    <input 
                      type="checkbox" 
                      id="privacy"
                      checked={privacyAgreed}
                      onChange={(e) => setPrivacyAgreed(e.target.checked)}
                      className="w-5 h-5 mt-0.5 rounded border-[#dbeafe] text-[#3b82f6] focus:ring-[#3b82f6] cursor-pointer" 
                    />
                    <label htmlFor="privacy" className="text-[11px] font-bold text-[#1e40af] leading-normal uppercase tracking-tight cursor-pointer">
                       Saya memahami bahwa sesi ini bersifat rahasia, sukarela, dan data saya hanya dapat diakses oleh konselor terkait.
                    </label>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button 
                      onClick={() => setSelectedSlot(null)}
                      className="flex-1 py-4 font-bold rounded-2xl border border-[#e5e5e5] text-[#a3a3a3] hover:bg-[#fafafa] transition-colors"
                    >
                      Batal
                    </button>
                    <button 
                      onClick={handleBooking}
                      disabled={bookingMutation.isPending}
                      className="flex-1 py-4 font-bold bg-[#f97316] text-white hover:bg-[#ea580c] rounded-2xl shadow-xl shadow-orange-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {bookingMutation.isPending ? 'Memproses...' : <>Konfirmasi <CheckCircle2 size={20}/></>}
                    </button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

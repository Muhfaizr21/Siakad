import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { psychologistService } from '../../services/api';

const Mail = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>mail</span>;
const Phone = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>phone</span>;
const MessageSquare = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>chat</span>;
const Clock = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>schedule</span>;

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');

  useEffect(() => {
    let ignore = false;
    psychologistService.getBookingDetail(id).then((res) => {
      if (!ignore) setBooking({ ...res.data, color: 'bg-primary' });
    });
    return () => { ignore = true; };
  }, [id]);

  const handleStatus = async (status, link = '') => {
    await psychologistService.updateBookingStatus(id, status, '', link);
    setBooking((prev) => ({ ...prev, status, link_meeting: link }));
  };

  const handleConfirmClick = () => {
    if (booking.mode === 'Online') {
      setMeetingLink('');
      setShowLinkModal(true);
    } else {
      handleStatus('Dikonfirmasi');
    }
  };

  const submitConfirmWithLink = () => {
    if (!meetingLink.trim()) {
      alert('Harap masukkan link meeting Zoom/Google Meet');
      return;
    }
    setShowLinkModal(false);
    handleStatus('Dikonfirmasi', meetingLink);
  };

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/30">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500 animate-pulse">Memuat Detail Booking...</p>
        </div>
      </div>
    );
  }

  const history = (booking.history || []).map((item) => ({ 
    ...item, 
    icon: item.type === 'created' ? MessageSquare : Clock, 
    color: item.type === 'created' ? 'text-blue-500' : 'text-amber-500' 
  }));
  const isLocked = booking.status === 'Dikonfirmasi' || booking.status === 'Selesai';

  return (
    <div className="w-full relative space-y-6 min-h-screen bg-transparent font-inter pb-8">
        
      {/* ── Breadcrumb / Back ────────────────────────────────────────── */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200/60 shadow-sm text-slate-500 hover:text-primary hover:border-primary/30 transition-all group w-fit"
      >
        <span className="material-symbols-outlined text-[16px] shrink-0 group-hover:-translate-x-1 transition-transform">arrow_back</span>
        <span className="text-[10px] font-black uppercase tracking-widest">Kembali</span>
      </button>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN (2/3) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden relative">
            {/* Header Banner */}
            <div className="h-28 relative bg-gradient-to-r from-primary to-blue-600 overflow-hidden">
               <div className="absolute inset-0 bg-white/5" style={{ backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px)`, backgroundSize: '20px 20px' }}></div>
               <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
               <div className="absolute -top-24 left-10 w-48 h-48 bg-black/10 rounded-full blur-3xl pointer-events-none" />
               
               <div className="absolute -bottom-10 left-6">
                  <div className={`w-20 h-20 rounded-2xl bg-white text-primary flex items-center justify-center text-3xl font-black border-[3px] border-slate-50 shadow-md`}>
                    {booking.avatar || booking.name.charAt(0)}
                  </div>
               </div>
            </div>
            
            <div className="pt-12 pb-6 px-6 relative z-10">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight font-headline">{booking.name}</h2>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">NIM {booking.nim} • {booking.prodi}</p>
                </div>
                <span className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest self-start ${
                  booking.status === 'Menunggu' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                  booking.status === 'Dikonfirmasi' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                  booking.status === 'Selesai' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                  'bg-rose-50 text-rose-600 border-rose-100'
                }`}>
                  <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${
                    booking.status === 'Menunggu' ? 'bg-amber-400' :
                    booking.status === 'Dikonfirmasi' ? 'bg-blue-400' :
                    booking.status === 'Selesai' ? 'bg-emerald-400' :
                    'bg-rose-400'
                  }`}></span>
                  {booking.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-100">
                {[
                  { label: 'Email', value: booking.email || '-', icon: Mail },
                  { label: 'WhatsApp', value: booking.phone || '-', icon: Phone },
                  { label: 'Akademik', value: `Smt ${booking.semester || '-'}`, icon: 'school' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                     <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                       {typeof item.icon === 'string' ? (
                         <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                       ) : (
                         <item.icon className="text-[18px] shrink-0" />
                       )}
                     </div>
                     <div className="overflow-hidden">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                        <p className="text-xs font-bold text-slate-700 truncate mt-0.5">{item.value}</p>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div className="space-y-4">
                  <div className="p-5 rounded-2xl border border-slate-200/60 flex items-center gap-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-primary shrink-0 shadow-sm">
                        <span className="material-symbols-outlined text-[24px]">calendar_month</span>
                      </div>
                     <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Tanggal Booking</p>
                        <p className="text-sm font-black text-slate-800 mt-0.5 font-headline">{booking.date}</p>
                     </div>
                  </div>
                  <div className="p-5 rounded-2xl border border-slate-200/60 flex items-center gap-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-primary shrink-0 shadow-sm">
                        <span className="material-symbols-outlined text-[24px]">schedule</span>
                      </div>
                     <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Waktu Booking</p>
                        <p className="text-sm font-black text-slate-800 mt-0.5 font-headline">{booking.time}</p>
                     </div>
                  </div>
                  <div className="p-5 rounded-2xl border border-slate-200/60 flex items-start gap-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-primary shrink-0 shadow-sm">
                        <span className="material-symbols-outlined text-[24px]">
                         {booking.mode === 'Online' ? 'videocam' : 'groups'}
                       </span>
                      </div>
                     <div className="flex-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Metode & Lokasi</p>
                        <p className="text-sm font-black text-slate-800 mt-0.5 font-headline">
                          {booking.mode === 'Online' ? 'Online (Zoom / Meet)' : 'Tatap Muka'}
                        </p>
                        {booking.mode === 'Online' && booking.link_meeting && (
                          <div className="mt-2 p-3 bg-white border border-slate-200 rounded-xl">
                            <a 
                              href={booking.link_meeting.startsWith('http') ? booking.link_meeting : `https://${booking.link_meeting}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 font-bold hover:underline break-all flex items-center gap-2"
                            >
                              <span className="material-symbols-outlined text-[14px]">link</span>
                              {booking.link_meeting}
                            </a>
                          </div>
                        )}
                     </div>
                  </div>
               </div>

               <div className="p-6 rounded-[1.5rem] bg-gradient-to-br from-primary to-[#003db5] text-white relative overflow-hidden flex flex-col justify-center min-h-[200px] shadow-md shadow-primary/10">
                  <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-[120px] text-white/5 pointer-events-none">psychology</span>
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-2">Topik Konseling (Isu)</p>
                    <p className="text-2xl lg:text-3xl font-black uppercase tracking-tight font-headline leading-tight">{booking.issue}</p>
                  </div>
               </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
               <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                 <span className="material-symbols-outlined text-[16px]">edit_note</span>
                 Catatan Mahasiswa
               </h4>
               <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-100/50 text-amber-900">
                  <p className="text-sm font-medium italic leading-relaxed">"{booking.note || 'Tidak ada catatan tambahan yang diberikan.'}"</p>
               </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (1/3) */}
        <div className="space-y-6">
          
          {/* Actions Card */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-6">
             <h3 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-4">
               <span className="material-symbols-outlined text-[16px]">bolt</span>
               Tindakan
             </h3>
             
             <div className="space-y-3">
                 <button
                   onClick={handleConfirmClick}
                   disabled={isLocked}
                   className="w-full py-3.5 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-sm hover:bg-primary/90 hover:shadow-md transition-all disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none flex items-center justify-center gap-2"
                 >
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    Konfirmasi Sesi
                 </button>
                 <button
                   onClick={() => handleStatus('Ditolak')}
                   disabled={isLocked}
                   className="w-full py-3.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-100 transition-all disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300 flex items-center justify-center gap-2"
                 >
                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                    Tolak Sesi
                 </button>
             </div>
             
             {isLocked && (
               <div className="rounded-xl p-4 bg-slate-50 border border-slate-100">
                 <p className="text-[10px] font-bold leading-5 text-slate-500 text-center">
                   Status booking sudah <span className="uppercase text-slate-800">{booking.status}</span>. Perubahan tidak dapat dilakukan.
                 </p>
               </div>
             )}
             
             <div className="pt-6 border-t border-slate-100">
               <button
                  onClick={() => navigate(`/psychologist/patients/${booking.mahasiswa_id}/medical-record?bookingId=${booking.id}`)}
                  className="w-full py-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all"
               >
                   <span className="material-symbols-outlined text-[18px]">description</span> 
                   Buka Rekam Medis
               </button>
             </div>
          </div>

          {/* History Card */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
             <h3 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">
               <span className="material-symbols-outlined text-[16px]">history</span>
               Riwayat Booking
             </h3>
             
             {history.length > 0 ? (
               <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                   {history.map((item, i) => (
                    <div key={i} className="flex gap-5 relative z-10">
                       <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center shadow-sm shrink-0">
                           <item.icon className={`text-[16px] shrink-0 ${item.color}`} />
                       </div>
                       <div className="pt-1">
                          <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{item.action}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.time}</p>
                       </div>
                    </div>
                  ))}
               </div>
             ) : (
               <p className="text-xs font-medium text-slate-500 text-center py-4">Belum ada riwayat tercatat.</p>
             )}
          </div>
        </div>

      </div>

      {/* Zoom / Meeting Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-8 py-6 bg-gradient-to-br from-primary to-blue-700 text-white relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <h3 className="text-xl font-black uppercase tracking-tight font-headline relative z-10">Konfirmasi Sesi Online</h3>
              <p className="text-xs text-blue-100 mt-2 relative z-10 font-medium">Harap masukkan link Zoom atau Google Meet untuk mahasiswa.</p>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Link Meeting</label>
                <input
                  type="text"
                  placeholder="https://zoom.us/j/... atau https://meet.google.com/..."
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-xs font-bold text-slate-800 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                />
              </div>
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowLinkModal(false); }}
                  className="flex-1 h-12 rounded-2xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={submitConfirmWithLink}
                  className="flex-1 h-12 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                >
                  Konfirmasi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
